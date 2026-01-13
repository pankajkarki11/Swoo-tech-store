import { test as base, expect } from '@playwright/test';
import { APIResponseTracker,performLogin } from '../../utils/APIResponseTracker.js';

console.log(' E2E TEST SUITE - Checkout operation ');
 
 base('Test : Should Perform Checkout Operation', async ({ page }) => {
     await performLogin(page);
  await page.waitForTimeout(2000);//to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);
    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();


    console.log("Checking Out Cart\n");
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    await confirmButton.click();
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('h1:has-text("Checkout")')).toBeVisible();


     // Fill payment details
    await page.fill('[aria-label="State"]', 'CA');
    await page.fill('[aria-label="Card Number"]', '4532015112830366');
    await page.fill('[aria-label="Name on Card"]', 'John Doe');
    await page.fill('[aria-label="Expiry Date"]', '12/25');
    await page.fill('[aria-label="CVV"]', '123');
    // Check terms and conditions
    await page.check('input[type="checkbox"][id="terms"]');


     await page.click('button:has-text("Place Order")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Confirm Order')).toBeVisible();
    await page.click('button:has-text("Place Order")');


    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    // Verify success message
    await expect(page.locator('text=Thank you for your purchase')).toBeVisible();
    // Verify order summary
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=Items')).toBeVisible();




    const cartResponse=tracker.assertCalled(/\/carts\/\d+$/, 'DELETE', 200);
    expect(cartResponse.body).toBeTruthy();

    console.log(`Detail of oder from API response during Checkout:\n\n`);
    console.log(`Cart ID :> ${cartResponse.body.id}`);
    console.log(`User ID :> ${cartResponse.body.userId}`);
    console.log(`Date of Order :> ${cartResponse.body.date}`);
    console.log(`Total Products in our Cart API for Checkout :> ${cartResponse.body.products.length}`);


     tracker.assertNoErrors();
    tracker.printSummary('Test : API Calls for whole operation\n');
    console.log('\n\n\n  ✅ Checkout Operation validated\n');
  });
