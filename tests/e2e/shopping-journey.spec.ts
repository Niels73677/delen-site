import { expect, test } from "@playwright/test";
import { hasDatabase, hasStripe, query, signedWebhook } from "./helpers";

test.describe("primary shopping journey", () => {
  test("browse → filter → product → bag → checkout → paid order", async ({ page, request }) => {
    test.skip(!hasDatabase || !hasStripe, "Requires local Supabase (TEST_DATABASE_URL) and Stripe test keys / stripe-mock");

    // Homepage
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/defined\s+by\s+style/i);
    await expect(page.getByRole("heading", { name: /best sellers/i })).toBeVisible();

    // Shop + filtering updates the URL and the grid
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Shop" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await page.getByRole("button", { name: "Trousers & Denim" }).click();
    await expect(page).toHaveURL(/category=trousers/);
    await expect(page.getByTestId("product-card")).toHaveCount(3);

    await page.getByTestId("sort-select").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await page.getByTestId("product-card").locator("p.tabular-nums").allInnerTexts();
    const values = prices.map((p) => Number(p.replace(/[^\d]/g, "")));
    expect([...values].sort((a, b) => a - b)).toEqual(values);

    await page.getByTestId("open-filters").click();
    await page.getByRole("dialog").getByRole("button", { name: "32", exact: true }).click();
    await expect(page).toHaveURL(/size=32/);
    await page.getByTestId("show-results").click();

    // Product detail page
    await page.goto("/products/essential-heavyweight-tee");
    await expect(page.getByRole("heading", { level: 1, name: "Essential Heavyweight Tee" })).toBeVisible();
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByText("Please select a size.")).toBeVisible();

    // Pick the first in-stock size of the selected colour
    const size = page.locator('[role="radiogroup"][aria-label="Size"] [role="radio"]:not([aria-disabled="true"])').first();
    await size.click();
    await page.getByTestId("add-to-bag").click();

    // Animated drawer opens with the item
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
    await expect(page.getByTestId("bag-count")).toHaveText("1");

    // Bag persists across a refresh
    await page.reload();
    await expect(page.getByTestId("bag-count")).toHaveText("1");

    // Cart page: quantity + discount codes (validated on the server)
    await page.goto("/cart");
    await page.getByRole("button", { name: "Increase quantity" }).first().click();
    await expect(page.getByTestId("cart-subtotal")).toHaveText("€90");
    await page.getByTestId("discount-input").fill("NOTREAL");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator("#discount-error")).toContainText(/not valid/i);
    await page.getByTestId("discount-input").fill("welcome10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByTestId("cart-discount")).toHaveText("−€9");
    await expect(page.getByTestId("cart-total")).toHaveText("€89"); // 90 − 9 + 8 shipping

    // Checkout redirects to Stripe (intercepted — we never load the real page)
    const variantStock = async () =>
      (
        await query<{ quantity: number }>(
          "select i.quantity from inventory i join order_items oi on oi.variant_id = i.variant_id join orders o on o.id = oi.order_id order by o.created_at desc limit 1",
        )
      )[0]?.quantity;
    await page.route("https://checkout.stripe.com/**", (route) => route.fulfill({ status: 200, body: "stripe checkout" }));
    await page.getByTestId("cart-checkout").click();
    await page.waitForURL(/checkout\.stripe\.com/);

    // A pending order now holds the stock
    const [order] = await query<{ id: string; status: string; stripe_checkout_session_id: string; total_cents: number; discount_cents: number }>(
      "select id, status, stripe_checkout_session_id, total_cents, discount_cents from orders order by created_at desc limit 1",
    );
    expect(order).toMatchObject({ status: "pending", total_cents: 8900, discount_cents: 900 });
    const stockWhilePending = await variantStock();

    // Stripe confirms payment via a signed webhook
    const { payload, signature } = signedWebhook("checkout.session.completed", {
      id: order!.stripe_checkout_session_id,
      object: "checkout.session",
      payment_status: "paid",
      payment_intent: "pi_e2e",
      amount_total: 8900,
      customer_details: {
        email: "shopper@e2e.test",
        name: "E2E Shopper",
        phone: null,
        address: { line1: "Prinsengracht 1", line2: null, city: "Amsterdam", postal_code: "1015", state: null, country: "NL" },
      },
      collected_information: {
        shipping_details: {
          name: "E2E Shopper",
          address: { line1: "Prinsengracht 1", line2: null, city: "Amsterdam", postal_code: "1015", state: null, country: "NL" },
        },
      },
      shipping_cost: { amount_total: 800 },
    });
    const forged = await request.post("/api/stripe/webhook", { data: payload, headers: { "stripe-signature": "t=1,v1=forged" } });
    expect(forged.status()).toBe(400);
    const res = await request.post("/api/stripe/webhook", {
      data: payload,
      headers: { "stripe-signature": signature, "content-type": "application/json" },
    });
    expect(res.status()).toBe(200);
    // Redelivery is a no-op
    const again = await request.post("/api/stripe/webhook", {
      data: payload,
      headers: { "stripe-signature": signature, "content-type": "application/json" },
    });
    expect((await again.json()).status).toBe("duplicate");

    const [paid] = await query<{ status: string; email: string }>("select status, email from orders where id = $1", [order!.id]);
    expect(paid).toEqual({ status: "paid", email: "shopper@e2e.test" });
    expect(await variantStock()).toBe(stockWhilePending); // stock stays deducted, not double-deducted

    // Success page reads the verified status and clears the bag
    await page.unroute("https://checkout.stripe.com/**");
    await page.goto(`/checkout/success?session_id=${order!.stripe_checkout_session_id}`);
    await expect(page.getByRole("heading", { name: /thank you/i })).toBeVisible();
    await expect(page.getByTestId("bag-count")).toHaveCount(0);
  });

  test("search with autocomplete", async ({ page }) => {
    test.skip(!hasDatabase, "Requires local Supabase");
    await page.goto("/shop");
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.getByRole("combobox", { name: "Search" }).fill("coat");
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/products\//);
  });

  test("sold-out products cannot be bought", async ({ page }) => {
    test.skip(!hasDatabase, "Requires local Supabase");
    await page.goto("/products/leather-biker-jacket");
    await expect(page.getByTestId("add-to-bag")).toBeDisabled();
    await expect(page.getByTestId("add-to-bag")).toHaveText(/sold out/i);
  });

  test("unknown pages render the custom 404", async ({ page }) => {
    const res = await page.goto("/products/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  });
});
