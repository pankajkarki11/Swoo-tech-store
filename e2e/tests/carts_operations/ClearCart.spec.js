import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performLogin,
} from "../../utils/APIResponseTracker.js";

console.log(" E2E TEST SUITE - Clear Cart Operation ");

base(
  "Test : Should Perform Clear Cart Operation",
  async ({ page }) => {
    await performLogin(page);
    await page.waitForTimeout(2000); //to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);

    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();

    console.log("Clearing Cart\n");


    const ClearButton = page
      .locator('[aria-label="Clear Cart"]')
      .first();
    await ClearButton.click();
    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(1000);

    const cartResponse = tracker.assertCalled(/\/carts\/\d+$/, "DELETE", 200);
    expect(cartResponse.body).toBeTruthy();

    console.log(
      `Total Products Cleared in cart API after Clearing Cart :> ${cartResponse.body.products.length}`
    );

    await expect(page.locator("[role='dialog']")).not.toBeVisible();
   await  expect( page.locator('h2:has-text("Your Cart is Empty")')).toBeVisible();
    tracker.assertNoErrors();
    tracker.printSummary(
      "Test : API Calls while Removing Item first time\n"
    );
  }
);
