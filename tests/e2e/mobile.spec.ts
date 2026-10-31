import { expect, test } from "@playwright/test";
import { hasDatabase } from "./helpers";

test.describe("mobile experience @mobile", () => {
  test.skip(!hasDatabase, "Requires local Supabase");

  test("full-screen navigation menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Collections" }).click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(menu).toBeHidden();
  });

  test("sticky add-to-bag appears after scrolling past the main button", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/products/tapered-chino");
    await page.mouse.wheel(0, 2500);
    await expect(page.getByRole("button", { name: /select size|add to bag/i }).last()).toBeVisible();
  });

  test("filters open in a drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/shop");
    await page.getByTestId("open-filters").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "M", exact: true }).click();
    await expect(page).toHaveURL(/size=M/);
  });
});
