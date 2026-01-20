import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - View Cart Detail page");

base("Can navigate to  Cart detail page", async ({ page }) => {
  await performAdminLogin(page);
  await page.goto("/admin/users");
  //as we dont need to track api response in login as we have done it in login test so we only test if it actually call the api when we click on add to cart button in home
  await page.waitForTimeout(2000);
  const users = page.getByTestId("users-table");
  const firstUser = await users
    .getByTestId("user-name")
    .first()
    .innerText();
  console.log(
    ` Navigating to Detail page Of User: "${firstUser}" `,
  );
  const tracker = new APIResponseTracker(page);

  const viewButton = page.getByTestId("view-button").first();
  await viewButton.click();

  await page.waitForTimeout(1000);

  const userDetailTitle=page.getByTestId('user-name');
 
  console.log(`Username in the User Detail page: ${await userDetailTitle.innerText()}  `)
  


  const userDetailResponse = tracker.assertCalled(
    /\/users\/\d+$/,
    "GET",
    200,
  );

  expect(userDetailResponse.body).toBeTruthy();

  console.log(
    `username in the API call ${userDetailResponse.body.name.firstname} ${userDetailResponse.body.name.lastname}`,
  );

  tracker.printSummary(
    "API Calls when we click Access first product detail page",
  );

});
