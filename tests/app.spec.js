const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads the dashboard", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /offline program manager/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /new program/i })).toBeVisible();
});

test("can create a program and calculate totals", async ({ page }) => {
  await page.getByRole("button", { name: /new program/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByLabel(/program code/i).fill("T01");
  await page.getByLabel(/fertilizer/i).fill("Test Fertilizer");
  await page.getByLabel(/value/i).fill("2.5");

  await page.getByRole("button", { name: /save/i }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("T01")).toBeVisible();

  const rows = page.locator("#consumptionRows [data-row-id]");
  await rows.first().locator("[data-role='code']").fill("T01");
  await rows.first().locator("[data-role='times']").fill("1");
  if ((await rows.count()) > 1) {
    await rows.nth(1).getByRole("button", { name: /remove/i }).click();
  }

  await page.getByRole("button", { name: /calculate/i }).click();
  await expect(page.locator("#summaryBody")).toContainText("TEST FERTILIZER");
});
