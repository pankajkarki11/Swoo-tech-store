import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performLogin,
} from "../../utils/APIResponseTracker.js";

console.log(" E2E TEST SUITE - Remove Item Operation ");

base(
  "Test : Should Perfrom Remove Operation From Cart Page",
  async ({ page }) => {
    const trackerfinal = new APIResponseTracker(page);
    await performLogin(page);
    await page.waitForTimeout(2000); //to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);

    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();

    console.log("Removing Item From Cart\n");


    const RemoveButton = page
      .locator('[aria-label="Remove item"]')
      .first();
    await RemoveButton.click();
    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(500);

    const cartResponse = tracker.assertCalled(/\/carts\/\d+$/, "PUT", 200);

    expect(cartResponse.body).toBeTruthy();

    console.log(
      `Total Products in cart API after Removing Item :> ${cartResponse.body.products.length}`
    );
    tracker.assertNoErrors();
    tracker.printSummary(
      "Test : API Calls while Removing Item first time\n"
    );

    console.log(
      "\n\n\n Remove Item using button For Second times\n\n\n"
    );

    const tracker2 = new APIResponseTracker(page);
    const RemoveButton2 = page
      .locator('[aria-label="Remove item"]')
      .first();
    await RemoveButton2.click();
    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton2 = page.locator('button:has-text("Confirm")');
    await confirmButton2.click();
    await page.waitForTimeout(500);

    const cartResponse2 = tracker2.assertCalled(/\/carts\/\d+$/, "PUT", 200);
    expect(cartResponse2.body).toBeTruthy();
    console.log(
      `Total Products in cart API after Removing Item for second time :> ${cartResponse2.body.products.length}`
    );

    tracker2.assertNoErrors();
    tracker2.printSummary(
      "Test : API Calls for second time Removing Item\n"
    );

    trackerfinal.assertNoErrors();
    trackerfinal.printSummary("Test : API Calls for whole operation\n");
    console.log("\n\n\n  ✅ Remove Item button validated\n");
  }
);
