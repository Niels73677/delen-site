import { expect, test } from "@playwright/test";
import { hasDatabase } from "./helpers";

test.describe("accounts & authorization", () => {
  test.skip(!hasDatabase, "Requires local Supabase");

  test("protected pages redirect anonymous visitors to sign in", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/account\/login\?next=%2Faccount%2Forders/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/account\/login\?next=%2Fadmin/);
  });

  test("register, manage profile & addresses, and stay out of /admin", async ({ page }) => {
    const email = `shopper-${Date.now()}@e2e.test`;
    await page.goto("/account/register");
    await page.getByLabel("Full name").fill("Robin Tester");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/at least 8 characters/i).first()).toBeVisible();

    await page.getByLabel("Password").fill("correct-horse-42");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Hello, Robin." })).toBeVisible();

    // Profile
    await page.getByLabel("Phone").fill("+31 6 1234 5678");
    await page.getByRole("button", { name: "Save details" }).click();
    await expect(page.getByText("Your details have been saved.")).toBeVisible();

    // Address book
    await page.getByRole("link", { name: "Addresses" }).first().click();
    await page.getByRole("button", { name: /add a new address/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Full name").fill("Robin Tester");
    await dialog.getByLabel("Address", { exact: true }).fill("Herengracht 100");
    await dialog.getByLabel("Postal code").fill("1015 BS");
    await dialog.getByLabel("City").fill("Amsterdam");
    await dialog.getByLabel("Set as default address").check();
    await dialog.getByRole("button", { name: "Save address" }).click();
    await expect(page.getByText("Herengracht 100")).toBeVisible();
    await expect(page.getByText("Default", { exact: true })).toBeVisible();

    // Customers cannot reach the admin dashboard
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/\?denied=admin/);

    // Sign out
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/login/);

    // Sign back in
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password").fill("correct-horse-42");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/account$/);
  });

  test("admin can sign in and manage the store", async ({ page }) => {
    test.skip(!process.env.E2E_ADMIN_EMAIL, "Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (see scripts/create-admin.mjs)");
    await page.goto("/account/login?next=/admin");
    await page.getByLabel("Email", { exact: true }).fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Total revenue")).toBeVisible();

    await page.getByRole("link", { name: "Discounts" }).click();
    const code = `E2E${Date.now().toString().slice(-6)}`;
    await page.getByLabel("Code").fill(code);
    await page.getByLabel("Percent off").fill("15");
    await page.getByRole("button", { name: "Create discount" }).click();
    await expect(page.getByRole("cell", { name: code, exact: true })).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: `Delete ${code}` }).click();
    await expect(page.getByRole("cell", { name: code, exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });
});
