import { test as base, expect } from '@playwright/test';
import { APIResponseTracker,performLogin } from '../utils/APIResponseTracker.js';

console.log(' E2E TEST SUITE - Product Detail Page ');
 
 base('Test : Should call Single Product API when clicking product', async ({ page }) => {
     await performLogin(page);
  await page.waitForTimeout(2000);//to load all the api which loads slowly like carts,products ,categories as we are not checking them so we tracck api calls after login before just clicking the product card.
    const tracker = new APIResponseTracker(page);
 
    const productCard = page.getByTestId('product-card').first();
    await productCard.scrollIntoViewIfNeeded();
    await productCard.click();
    
    // Wait for navigation
    await page.waitForURL(/\/products\/\d+$/);
    await page.waitForTimeout(2000);



    const productsResponse=tracker.assertCalled(/\/products\/\d+$/, 'GET', [200,304]);

    if (productsResponse.status === 200) {
  expect(productsResponse.body).toBeTruthy();
  const productName = productsResponse.body.title;

  const productTitleUi = page.locator('h1').nth(1);
  //nth(0) returns the first element (which is the first element)


     console.log(`product name from UI : ${productTitleUi}`);//we cannot directly print locator object it will shows object and property so to print the name we have to fetch its text content using .textcontent();

    await expect(productTitleUi).toContainText(productName);//to containtext can be only used with loactor and not with textcontent

 
   console.log(`    Product name from API: ${productName}`);
}

  console.log('\n✅  Validated product name in UI and API\n\n');


   console.log('\n  Cruid Operations from Product detail page\n\n');





    const quantityInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    const currentQty = await quantityInput.inputValue();
    const newQty = parseInt(currentQty) + 4;
    
    await quantityInput.fill(newQty.toString());
    await quantityInput.press('Enter');
    await page.waitForTimeout(500);
    
     await expect(page.locator('[role="dialog"]')).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    console.log(`     ✓ Quantity updated: ${currentQty} → ${newQty}\n`);
    await page.waitForTimeout(1000);



    console.log ("Decrease quantity by 1 using button ")
    const decreaseQuantityButton = page.locator('[aria-label="Decrease quantity"]').first();
    await decreaseQuantityButton.click();
    await page.waitForTimeout(500);
    

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton1 = page.locator('button:has-text("Confirm")');
      await confirmButton1.click();
        await page.waitForTimeout(500);
       const currentQtyAfterDecrease = await quantityInput.inputValue();

     console.log(`     ✓ Quantity updated: ${newQty} → ${currentQtyAfterDecrease}\n`);
     await page.waitForTimeout(1000);
      console.log('   ✓ Quantity Decrease button triggered');
    


        console.log ("Increase quantity by 1 using button ")
        const increaseQuantityButton = page.locator('[aria-label="Increase quantity"]').first();
        await increaseQuantityButton.click();
        await page.waitForTimeout(500);

        await expect(page.locator("[role='dialog']")).toBeVisible();
        const confirmButton2 = page.locator('button:has-text("Confirm")');
        await confirmButton2.click();
          await page.waitForTimeout(500);
       const currentQtyAfterIncrease = await quantityInput.inputValue();

     console.log(`     ✓ Quantity updated: ${newQty-1} → ${currentQtyAfterIncrease}\n`);
     await page.waitForTimeout(1000);
        console.log('     ✓ Quantity Increase button triggered');




         console.log ("Remove Item From Cart ")
         const removeButton = page.locator('[aria-label="Remove item"]').first();
         await removeButton.click();

         await page.waitForTimeout(500);

         await expect(page.locator("[role='dialog']")).toBeVisible();
         const confirmButton3 = page.locator('button:has-text("Confirm")');
         await confirmButton3.click();
         await page.waitForTimeout(1500);
         console.log('     ✓ Item Removed from Cart button triggered');



    tracker.assertNoErrors();
    tracker.printSummary('Test : API Calls for Single Product\n');
    console.log('\n\n\n  ✅ TEST 3 PASSED: Product detail API validated\n');
  });
