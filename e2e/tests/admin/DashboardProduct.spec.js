import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Access product detail page through Dashboard");

base("Can navigate to recent added product detail page", async ({ page }) => {
  await performAdminLogin(page);

  //as we dont need to track api response in login as we have done it in login test so we only test if it actually call the api when we click on add to cart button in home
  await page.waitForTimeout(2000);
  const product = page.getByTestId("recent-products-table items");
  await product.scrollIntoViewIfNeeded();
  const firstProduct = product.getByTestId("product-title").first();
  const firstProductName = await product
    .getByTestId("product-title")
    .first()
    .innerText();
  console.log(
    ` Navigating to "${firstProductName.substring(0, 40)}..." detail page`,
  );
  const tracker = new APIResponseTracker(page);

  await firstProduct.click();

  await page.waitForTimeout(1000);
  const productDetailResponse = tracker.assertCalled(
    /\/products\/\d+$/,
    "GET",
    200,
  );

  expect(productDetailResponse.body).toBeTruthy();

  

  console.log(
    `Title of product in the API call ${productDetailResponse.body.title}`,
  );

  tracker.printSummary(
    "API Calls when we click Access first product detail page",
  );

  await page.waitForTimeout(2000);
  console.log(`\n\n\nAccessing second product\n\n\n`);
  await page.goto("/admin/dashboard");
  await page.waitForTimeout(2000); //to load all data before trcaking all the api calls so that the called api here willnot affect out api calls when we click on second product detail page

  await product.scrollIntoViewIfNeeded();

  const secondProduct = product.getByTestId("product-title").nth(1);
  const secondProductName = await product
    .getByTestId("product-title")
    .nth(1)
    .innerText();
  console.log(
    ` Now Navigating to "${secondProductName.substring(0, 40)}..." detail page`,
  );
  const tracker2 = new APIResponseTracker(page);

  await secondProduct.click();
  await page.waitForTimeout(1000);
  const productDetailResponse2 = tracker2.assertCalled(
    /\/products\/\d+$/,
    "GET",
    200,
  );

  expect(productDetailResponse2.body).toBeTruthy();
  console.log(
    `Title of product in the API call ${productDetailResponse2.body.title}`,
  );

  tracker2.printSummary(
    "API Calls when we click on the second product detail page",
  );

  console.log(
    "Accessing product page when clicking View all products in dashboard",
  );
  await page.goto("/admin/dashboard");
  await page.waitForTimeout(2000);
  const tracker3 = new APIResponseTracker(page);
  const viewAll = page.getByTestId("view-all-products-button");
  await viewAll.click();
  await page.waitForTimeout(1000);
  const viewAllResponse = tracker3.assertCalled(/\/products$/, "GET", [200,304]);
  const viewAllResponse2 = tracker3.assertCalled(
    /\/products\/categories$/,
    "GET",
    [200,304]
  );
  //    const viewAllResponse3=tracker3.assertCalled(/\/carts$/, 'GET', 200);//as it is not called so if we include here then we get error saying this api is not called ,this verified that only these thwo produycts and categories are called when we click view all products
  if (viewAllResponse.status === 200 ) {
   expect(viewAllResponse.body).toBeTruthy();
  }
  if (viewAllResponse2.status === 200 ) {
    expect(viewAllResponse2.body).toBeTruthy();
  }
  // if (viewAllResponse3.status === 200 ) {
  //   expect(viewAllResponse3.body).toBeTruthy();
  // }

  tracker3.printSummary(
    "API Calls when we click View all products in dashboard",
  );
});
