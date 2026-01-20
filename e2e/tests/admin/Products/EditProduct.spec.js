import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Edit Existing product");

base("Can Edit existing product", async ({ page }) => {
  await performAdminLogin(page);
  
   
  await page.goto("/admin/products");
      await page.waitForTimeout(2000);
    const tracker = new APIResponseTracker(page);
  
  const editProduct=page.getByTestId("edit-button").first();//initial edit button of the furst product
  await editProduct.click();
     

    await expect(page.locator("[role='dialog']")).toBeVisible();
    await page.fill('[  data-testid="product-title"]', 'This is the Updated Product Title');
    await page.fill('[  data-testid="product-price"]', '1');

const updateButton=page.getByTestId('create-product-button');
await updateButton.click();
  await page.waitForTimeout(1000);
const productTable=page.getByTestId('products-table');
const addedProductName= await productTable.getByTestId('product-title-name').nth(0).innerText();

 console.log(
    ` Updated product name in the table:  "${addedProductName}" `,
  );
  const productDetailResponse = tracker.assertCalled(
    /\/products\/\d+$/,
    "PUT",
    200,
  );
  expect(productDetailResponse.body).toBeTruthy();
  console.log(
    `updated product title in the API call :  "${productDetailResponse.body.title}"`,
  );

  tracker.printSummary(
    "API Calls when we Try to Update new product"  ,
  );

});
