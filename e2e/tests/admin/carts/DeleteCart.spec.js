import { test as base, expect } from "@playwright/test";
import {
  APIResponseTracker,
  performAdminLogin,
} from "../../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Deleting Existing Cart");

base("Can Delete existing Cart", async ({ page }) => {
  await performAdminLogin(page);
  
   
  await page.goto("/admin/carts");
      await page.waitForTimeout(2000);
    const tracker = new APIResponseTracker(page);
const cartTable=page.getByTestId('cart-table');
    const firstCartId= Number(await cartTable.getByTestId('cart-id').first().innerText());

 console.log(
    ` Cart to be deleted in table:  "${firstCartId}" `,
  );
  
  const deleteCart=page.getByTestId("delete-button").first();//initial edit button of the furst product
  await deleteCart.click();
     

await expect(page.locator("[role='dialog']")).toBeVisible();
  const deleteButton=page.getByTestId('delete-confirm-button');
await deleteButton.click();
  await page.waitForTimeout(1000);

  const cartDetailResponse = tracker.assertCalled(
    /\/carts\/\d+$/,
    "DELETE",
    200,
  );
  expect(cartDetailResponse.body).toBeTruthy();
  console.log(
    `deleted cart id in the API call :  "${cartDetailResponse.body.id}"`,
  );
  expect(cartDetailResponse.body.id).toBe(firstCartId);

  tracker.printSummary(
    "API Calls when we Try to Delete new Cart"  ,
  );
});
