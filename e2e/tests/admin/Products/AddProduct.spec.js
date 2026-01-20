import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Add new product");

base("Can Add new product", async ({ page }) => {
  await performAdminLogin(page);
  
   
  await page.goto("/admin/products");
      await page.waitForTimeout(2000);
    const tracker = new APIResponseTracker(page);
  
  const addProduct=page.getByTestId("add-new-button");
  await addProduct.click();
     

    await expect(page.locator("[role='dialog']")).toBeVisible();
    await page.fill('[  data-testid="product-title"]', 'PS6');
    await page.fill('[  data-testid="product-price"]', '45');
    await page.selectOption('[ data-testid="product-category"]', 'Electronics');
    await page.fill('[ data-testid="product-image"]', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1600');
    await page.fill('[data-testid="product-description"]', 'This is the newly desgined model of new playstation coming this summer 2026 in your near store at just $999.99');

const createButton=page.getByTestId('create-product-button');
await createButton.click();
  await page.waitForTimeout(1000);
const productTable=page.getByTestId('products-table');
const addedProductName= await productTable.getByTestId('product-title-name').nth(20).innerText();

 console.log(
    ` Added product "${addedProductName}" to the product table`,
  );
expect(addedProductName).toBe('PS6');
expect(productTable).toContainText('PS6');


  const productDetailResponse = tracker.assertCalled(
    /\/products$/,
    "POST",
    201,
  );//201 for post request
  expect(productDetailResponse.body).toBeTruthy();
  console.log(
    `Title of Added product in the API call ${productDetailResponse.body.title}`,
  );

  tracker.printSummary(
    "API Calls when we Try to add new product"  ,
  );

});
