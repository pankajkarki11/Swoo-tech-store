import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - View Product Detail page");

base("Can navigate to  product detail page", async ({ page }) => {
  await performAdminLogin(page);
  await page.goto("/admin/products");

  //as we dont need to track api response in login as we have done it in login test so we only test if it actually call the api when we click on add to cart button in home
  await page.waitForTimeout(2000);
  const product = page.getByTestId("products-table");
  const firstProductName = await product
    .getByTestId("product-title-name")
    .first()
    .innerText();
  console.log(
    ` Navigating to "${firstProductName.substring(0, 40)}..." detail page`,
  );
  const tracker = new APIResponseTracker(page);

  const viewButton = page.getByTestId("view-button").first();
  await viewButton.click();

  await page.waitForTimeout(1000);

  const productDetailTitle=page.getByTestId('product-title');
 
  console.log(`Title of product in the UI ${await productDetailTitle.innerText()}  in the detail page`)
  


  const productDetailResponse = tracker.assertCalled(
    /\/products\/\d+$/,
    "GET",
    [200,304]
  );
if(productDetailResponse.status === 200){
    expect(productDetailResponse.body).toBeTruthy();

  console.log(
    `Title of product in the API call ${productDetailResponse.body.title}`,
  );
  
}


  tracker.printSummary(
    "API Calls when we click Access first product detail page",
  );

});
