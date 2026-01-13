import { test as base, expect } from '@playwright/test';
import { APIResponseTracker,performLogin } from '../../utils/APIResponseTracker.js';

console.log(' E2E TEST SUITE - Increase Button Page ');
 
 base('Test : Should call Single Product API when clicking product', async ({ page }) => {
     const trackerfinal = new APIResponseTracker(page);
     await performLogin(page);
  await page.waitForTimeout(2000);//to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);

    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    console.log('     ✓ Cart page loaded\n');

    const quantityInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    const currentQty = await quantityInput.inputValue();
    const newQty = parseInt(currentQty);


        console.log ("Increase quantity by 1 using button ")
        const increaseQuantityButton = page.locator('[aria-label="Increase quantity"]').first();
        await increaseQuantityButton.click();
        await page.waitForTimeout(500);

        await expect(page.locator("[role='dialog']")).toBeVisible();
        const confirmButton = page.locator('button:has-text("Confirm")');
        await confirmButton.click();
          await page.waitForTimeout(500);
       const currentQtyAfterIncrease = await quantityInput.inputValue();

           console.log(`     ✓ Quantity updated: ${newQty} → ${currentQtyAfterIncrease}\n`);
          await page.waitForTimeout(1000);
          const cartResponse=tracker.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

         expect(cartResponse.body).toBeTruthy();

        console.log(`Products Quantity in cart API after increase :> ${cartResponse.body.products[0].quantity}`);
   tracker.assertNoErrors();
    tracker.printSummary('Test : API Calls adding product first time\n');

    console.log('\n\n\n Increase quantity by 1 using button For Second times\n\n\n');


 const tracker2 = new APIResponseTracker(page);

      const quantityInput2 = page.locator('input[type="text"][inputmode="numeric"]').first();
      const currentQty2 = await quantityInput2.inputValue();
       const newQty2 = parseInt(currentQty2);


        console.log ("Increase quantity by 1 using button ")
        const increaseQuantityButton2 = page.locator('[aria-label="Increase quantity"]').first();
        await increaseQuantityButton2.click();
        await page.waitForTimeout(500);

        await expect(page.locator("[role='dialog']")).toBeVisible();
        const confirmButton2 = page.locator('button:has-text("Confirm")');
        await confirmButton2.click();
          await page.waitForTimeout(500);
       const currentQtyAfterIncrease2 = await quantityInput2.inputValue();

           console.log(`     ✓ Quantity updated: ${newQty2} → ${currentQtyAfterIncrease2}\n`);
          await page.waitForTimeout(1000);
          const cartResponse2=tracker2.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

         expect(cartResponse2.body).toBeTruthy();

        console.log(`Products Quantity in cart API after increase :> ${cartResponse2.body.products[0].quantity}`);

    tracker2.assertNoErrors();
    tracker2.printSummary('Test : API Calls for second time adding\n');

     trackerfinal.assertNoErrors();
    trackerfinal.printSummary('Test : API Calls for whole operation\n');
    console.log('\n\n\n  ✅ TEST 3 PASSED: Product detail API validated\n');
  });
