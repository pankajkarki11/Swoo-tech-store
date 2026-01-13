import { test as base, expect } from '@playwright/test';
import { APIResponseTracker,performLogin } from '../../utils/APIResponseTracker.js';

console.log(' E2E TEST SUITE - Decrease Button Page ');
 
 base('Test : Should Perform Decrease Quantity Operation', async ({ page }) => {
     const trackerfinal = new APIResponseTracker(page);
     await performLogin(page);
  await page.waitForTimeout(2000);//to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);

    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    console.log('     ✓ Cart page loaded\n');


    const quantityInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    const currentQty = await quantityInput.inputValue();
    const newQty = 12;

   await quantityInput.fill(newQty.toString());
    await quantityInput.press('Enter');
    await page.waitForTimeout(500);
    
     await expect(page.locator('[role="dialog"]')).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    console.log(`   ✓ Quantity updated: ${currentQty} → ${newQty}\n`);
    await page.waitForTimeout(1000);

          const cartResponse=tracker.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

         expect(cartResponse.body).toBeTruthy();

        console.log(`Products Quantity in cart API after Input :> ${cartResponse.body.products[0].quantity}`);
   tracker.assertNoErrors();
    tracker.printSummary('Test : API Calls Inputing Quantity first time\n');

    console.log('\n\n\n Change Input  quantity For Second times\n\n\n');


 const tracker2 = new APIResponseTracker(page);

      const quantityInput2 = page.locator('input[type="text"][inputmode="numeric"]').first();
      const currentQty2 = await quantityInput2.inputValue();
       const newQty2 = 3;


 await quantityInput2.fill(newQty2.toString());
    await quantityInput2.press('Enter');
    await page.waitForTimeout(500);
    
     await expect(page.locator('[role="dialog"]')).toBeVisible();
    const confirmButton2 = page.locator('button:has-text("Confirm")');
    if (await confirmButton2.isVisible()) {
      await confirmButton2.click();
    }
    
    console.log(`   ✓ Quantity updated: ${currentQty2} → ${newQty2}\n`);
    await page.waitForTimeout(1000);

          const cartResponse2=tracker2.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

         expect(cartResponse2.body).toBeTruthy();

        console.log(`Products Quantity in cart API after Input :> ${cartResponse2.body.products[0].quantity}`);

    tracker2.assertNoErrors();
    tracker2.printSummary('Test : API Calls for second time decreasing quantity\n');

     trackerfinal.assertNoErrors();
    trackerfinal.printSummary('Test : API Calls for whole operation\n');
    console.log('\n\n\n  ✅ Input button validated\n');
  });
