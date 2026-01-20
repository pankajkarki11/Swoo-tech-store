import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Deleting Existing User");

base("Can Delete existing User", async ({ page }) => {
  await performAdminLogin(page);
  
   
  await page.goto("/admin/users");
      await page.waitForTimeout(2000);
    const tracker = new APIResponseTracker(page);
const usersTable=page.getByTestId('users-table');
    const firstUsername= await usersTable.getByTestId('user-name').first().innerText();

 console.log(
    ` User to be deleted in table:  "${firstUsername}" `,
  );
  
  const deleteCart=page.getByTestId("delete-button").first();//initial edit button of the furst product
  await deleteCart.click();
     

await expect(page.locator("[role='dialog']")).toBeVisible();
  const deleteButton=page.getByTestId('delete-confirm-button');
await deleteButton.click();
  await page.waitForTimeout(1000);

  const userDetailResponse = tracker.assertCalled(
    /\/users\/\d+$/,
    "DELETE",
    200,
  );
  expect(userDetailResponse.body).toBeTruthy();

  console.log(
    `deleted User in the API call : "${userDetailResponse.body.name.firstname} ${userDetailResponse.body.name.lastname}"`,
  );
  tracker.printSummary(
    "API Calls when we Try to Delete new Cart"  ,
  );
});
