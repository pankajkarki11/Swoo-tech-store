import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - View Cart Detail page");

base("Can navigate to  Cart detail page", async ({ page }) => {
  await performAdminLogin(page);
  await page.goto("/admin/carts");
  //as we dont need to track api response in login as we have done it in login test so we only test if it actually call the api when we click on add to cart button in home
  await page.waitForTimeout(2000);
  const cart = page.getByTestId("cart-table");
  const firstCartId = await cart
    .getByTestId("cart-id")
    .first()
    .innerText();
  console.log(
    ` Navigating to CartID "${firstCartId}" `,
  );
  const tracker = new APIResponseTracker(page);

  const viewButton = page.getByTestId("view-button").first();
  await viewButton.click();

  await page.waitForTimeout(1000);

  const cartDetailTitle=page.getByTestId('cart-title');
 
  console.log(`Cart ID in the Detail page: ${await cartDetailTitle.innerText()}  `)
  


  const cartDetailResponse = tracker.assertCalled(
    /\/carts\/\d+$/,
    "GET",
    200,
  );

  expect(cartDetailResponse.body).toBeTruthy();

  console.log(
    `Cart ID in the API call #${cartDetailResponse.body.id}`,
  );

  tracker.printSummary(
    "API Calls when we click Access first product detail page",
  );

});
