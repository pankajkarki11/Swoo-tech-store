import { test as base, expect } from '@playwright/test';
import { APIResponseTracker,performLogin } from '../utils/APIResponseTracker.js';

console.log("E2E TEST SUITE - Add to Cart Page ");



base('Should Perform ADD To Cart Operation From Homepage', async ({ page }) => {
   await performLogin(page);

   //as we dont need to track api response in login as we have done it in login testso we only test if it actually call the api when we click on add to cart button in home
  const product = page.getByTestId('product-card')
    .filter({ has: page.locator('button:has-text("Add to Cart")') })
    .first();
  await product.scrollIntoViewIfNeeded();
  const productName = await product.locator('h3').textContent();
  console.log(`   → Adding to cart: "${productName.substring(0, 40)}..."`);
  

  const addButton=product.locator('button:has-text("Add to Cart")');
  await page.waitForTimeout(2000);
  const tracker = new APIResponseTracker(page);
  await addButton.click();

  await page.waitForTimeout(1000);
  const addToCartResponse=tracker.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

expect(addToCartResponse.body).toBeTruthy();

console.log(`Total Unique products in carts from API ${addToCartResponse.body.products.length}`);

   tracker.printSummary('API Calls when we click add to cart');

 await page.waitForTimeout(2000);
   console.log(`\n\n\nAdd to Cart for Second time\n\n\n`)
    const product2 = page.getByTestId('product-card')
    .filter({ has: page.locator('button:has-text("Add to Cart")') })
    .first();

  await product.scrollIntoViewIfNeeded();
  const productName2 = await product2.locator('h3').textContent();
  console.log(`   → Adding to cart: "${productName2.substring(0, 40)}..."`);
  

  const addButton2=product2.locator('button:has-text("Add to Cart")');
  await page.waitForTimeout(2000);
  const tracker2 = new APIResponseTracker(page);
  await addButton2.click();

  await page.waitForTimeout(1000);
  const addToCartResponse2=tracker2.assertCalled(/\/carts\/\d+$/, 'PUT', 200);

expect(addToCartResponse2.body).toBeTruthy();
console.log(`Total Unique products in carts ${addToCartResponse2.body.products.length}`);
   tracker2.printSummary('API Calls when we click add to cart for second time');
  });


  
