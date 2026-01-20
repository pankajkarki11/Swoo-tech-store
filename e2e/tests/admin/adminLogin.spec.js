import { test as base, expect } from "@playwright/test";
import { APIResponseTracker, performLogin } from "../../utils/APIResponseTracker.js";

console.log("E2E TEST SUITE - Login Page");

base("Performing login flow ", async ({ page }) => {
  const tracker = new APIResponseTracker(page);

  // 1. Perform user action
  await performLogin(page);

  // Wait until login API is actually called
  //used to get data from the api called in our page so we can check the actual api is called or not and can test the status too.it conly check if the api is called or not but doesnt shows if match with correct status code but it
  await expect.poll(() => tracker.hasCall(/\/auth\/login$/, "POST")).toBe(true);

  // Extract response body but it is redundant as we have assertCalled funtoon to check status and response
  // const loginResponse = tracker.getResponseBody(/\/auth\/login$/, 'POST');

  const loginResponse = tracker.assertCalled("/auth/login", "POST", 201);

  expect(loginResponse.body).toBeTruthy();
  expect(loginResponse.body.token).toBeTruthy();

  // Save token if needed
  const token = loginResponse.body.token;
  console.log("🔐 Login token:", token);

  // 2. Verify UI result
  await expect(page.getByText("John")).toBeVisible();
  await page.waitForTimeout(2000);
  // 3. Verify side effects (APIs, storage)

  //this is to verifu if thr following api is called once or not but doesnt check the actual status  and even if they are called but dshows wrong status like 400,500 they will pass beacuse it only check if it is called or not not actual data and responses.so it is valid to use here because we focus on login here not actaul all data for it we check in other test files
  expect(tracker.hasCall("/users", "GET")).toBe(true);
  expect(tracker.hasCall(/\/carts\/user\/\d+$/, "GET")).toBe(true);
  expect(tracker.hasCall(/\/products\/\d+$/, "GET")).toBe(true);

  expect(tracker.hasCall("/products/categories", "GET")).toBe(true);
  expect(tracker.hasCall("/products", "GET")).toBe(true);

  const storedToken = await page.evaluate(() =>
    localStorage.getItem("swmart_token")
  );

  expect(storedToken).toBe(token);
  // 4. Check for errors
  tracker.assertNoErrors();
  tracker.printSummary();
});
