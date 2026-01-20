import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Deleting Existing product");

base("Can Delete existing product", async ({ page }) => {
  await performAdminLogin(page);
  
   
  await page.goto("/admin/products");
      await page.waitForTimeout(2000);
    const tracker = new APIResponseTracker(page);
const productTable=page.getByTestId('products-table');
    const firstProductName= await productTable.getByTestId('product-title-name').nth(0).innerText();

 console.log(
    ` Product to be deleted in table:  "${firstProductName}" `,
  );
  
  const deleteProduct=page.getByTestId("delete-button").first();//initial edit button of the furst product
  await deleteProduct.click();
     

await expect(page.locator("[role='dialog']")).toBeVisible();
  const deleteButton=page.getByTestId('delete-confirm-button');
await deleteButton.click();
  await page.waitForTimeout(1000);


  const productDetailResponse = tracker.assertCalled(
    /\/products\/\d+$/,
    "DELETE",
    200,
  );
  expect(productDetailResponse.body).toBeTruthy();
  console.log(
    `deleted product title in the API call :  "${productDetailResponse.body.title}"`,
  );

  tracker.printSummary(
    "API Calls when we Try to Delete new product"  ,
  );
});
