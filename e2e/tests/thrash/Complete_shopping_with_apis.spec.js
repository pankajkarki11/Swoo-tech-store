// // e2e/tests/api-validation-complete-FIXED.spec.js
// import { test as base, expect } from '@playwright/test';

// const TEST_CONFIG = {
//   username: process.env.TEST_USERNAME || 'johnd',
//   password: process.env.TEST_PASSWORD || 'm38rmF$',
//   baseURL: process.env.BASE_URL || 'http://localhost:5173',
// };

// console.log('\n🔧 API Validation Test Configuration:');
// console.log('  Username:', TEST_CONFIG.username);
// console.log('  Password:', '***');


// async function waitForAPIResponse(page, urlPattern, method = 'GET', options = {}) {
//   const {
//     timeout = 10000,
//     validStatuses = [200, 201,304],
//     optional = false,
//   } = options;

//   try {
//     const response = await page.waitForResponse(
//       r => r.url().includes(urlPattern) && r.request().method().includes(method),
//       { timeout }
//     );
    
//     const status = response.status();
    
//     // Validate status code
//     if (!validStatuses.includes(status)) {
//       console.warn(`  ⚠️  API returned status ${status}, expected one of: ${validStatuses.join(', ')}`);
//     }
    
//     expect(validStatuses).toContain(status);
    
//     return response;
//   } catch (error) {
//     if (optional) {
//       console.log(`  ℹ️  Optional API call not detected: ${urlPattern}`);
//       return null;
//     }
//     throw error;
//   }
// }

// /**
//  * Get localStorage data
//  */
// async function getLocalStorageItem(page, key) {
//   return await page.evaluate((k) => {
//     const item = localStorage.getItem(k);
//     return item ? JSON.parse(item) : null;
//   }, key);
// }

// /**
//  * Login helper with proper status code handling
//  */
// async function loginUser(page) {
//   await page.goto('/login');
  
//   // Setup API listeners - Login returns 201, Users returns 200
//   const loginPromise = waitForAPIResponse(page, '/auth/login', 'POST');
//   const usersPromise = waitForAPIResponse(page, '/users', 'GET');
  
//   // Click demo account and login
//   await page.click('text=John Doe');
//   await page.waitForTimeout(500);
//   await page.click('button:has-text("Sign In")');
  
//   // Wait for API responses
//   const [loginResponse, usersResponse] = await Promise.all([
//     loginPromise,
//     usersPromise,
//   ]);
  
//   await page.waitForURL('/');
  
//   return { loginResponse, usersResponse };
  
// }


// // ============================================================================
// // TEST SUITE
// // ============================================================================

// base.describe('API Validation - Complete Test Suite (Fixed)', () => {
  
//   // ============================================================================
//   // TEST 1: Homepage - Products & Categories API
//   // ============================================================================
//   base('should validate Homepage API calls', async ({ page }) => {
//     console.log('\n🎯 TEST: Homepage API Validation');
    
//     // Setup API listeners
//     const productsPromise = waitForAPIResponse(page, '/products', 'GET');
//     const categoriesPromise = waitForAPIResponse(page, '/products/categories', 'GET');
    
//     // Navigate to homepage
//     await page.goto('/');
    
//     // Wait for both API calls
//     const [productsResponse, categoriesResponse] = await Promise.all([
//       productsPromise,
//       categoriesPromise,
//     ]);
    
//     // ========================================================================
//     // Validate Products API
//     // ========================================================================
//     console.log('  → Validating Products API...');
    
//     const productsData = await productsResponse.json();
    
//     expect(Array.isArray(productsData)).toBe(true);
//     expect(productsData.length).toBeGreaterThan(0);
//     console.log(`  ✅ Products API returned ${productsData.length} products`);
//     console.log(productsData[0]);
    
//     // Validate first product structure
//     const product = productsData[0];
//     const requiredFields = ['id', 'title', 'price', 'description', 'category', 'image', 'rating'];
    
//     requiredFields.forEach(field => {
//       expect(product).toHaveProperty(field);
//     });
//     console.log('  ✅ Product structure validated & contain all necessary fields');
    
//     // Validate data types
//     expect(typeof product.id).toBe('number');
//     expect(typeof product.title).toBe('string');
//     expect(typeof product.price).toBe('number');
//     expect(typeof product.rating.rate).toBe('number');
//     expect(typeof product.rating.count).toBe('number');
//     console.log('  ✅ Data types validated');

//     // ========================================================================
//     // Validate Categories API
//     // ========================================================================
//     console.log('  → Validating Categories API...');
    
//     const categoriesData = await categoriesResponse.json();
    
//     expect(Array.isArray(categoriesData)).toBe(true);
//     expect(categoriesData.length).toBeGreaterThan(0);
//     console.log(`  ✅ Categories API returned ${categoriesData.length} categories`);
    
    
//     console.log('  → Validating UI rendering... in Homepage');

//     await page.waitForSelector('.group', { timeout: 5000 });
//     const productCards = await page.locator('.group').count();
//     expect(productCards).toBeGreaterThan(0);
//     console.log(`  ✅ UI renders ${productCards} products`);
    
//     console.log('✅ Homepage API validation passed!\n');
//   });

  
//   // ============================================================================
//   // TEST 2: Login Page - Auth & Users API
//   // ============================================================================
//   base('should validate Login Page API calls', async ({ page }) => {
//     console.log('\n🎯 TEST: Login Page API Validation');
    
//     await page.goto('/login');
    
//     // Setup API listeners with correct status codes
//     const loginPromise = waitForAPIResponse(page, '/auth/login', 'POST', {
//       validStatuses: [ 201], 
//     });
//     const usersPromise = waitForAPIResponse(page, '/users', 'GET',);
    
//     // Perform login
//     await page.click('text=John Doe');
//     await page.waitForTimeout(500);
//     await page.click('button:has-text("Sign In")');
    
//     // Wait for API responses
//     const [loginResponse, usersResponse] = await Promise.all([
//       loginPromise,
//       usersPromise,
//     ]);
    
//     // ========================================================================
//     // Validate Login API
//     // ========================================================================
//     console.log('  → Validating Login API...');
    
//     const loginData = await loginResponse.json();
//     const loginStatus = loginResponse.status();
    
//     console.log(`  → Login API Status: ${loginStatus}`);
//     expect([201]).toContain(loginStatus);
//     expect(loginData).toHaveProperty('token');
//     expect(typeof loginData.token).toBe('string');
//     expect(loginData.token.length).toBeGreaterThan(0);
//     console.log(`  ✅ Token received (${loginData.token.length} chars)`);
    
//     // ========================================================================
//     // Validate Users API
//     // ========================================================================
//     console.log('  → Validating Users API...');
    
//     const usersData = await usersResponse.json();
    
//     expect(Array.isArray(usersData)).toBe(true);
//     expect(usersData.length).toBeGreaterThan(0);
//     console.log(`  ✅ Users API returned ${usersData.length} users`);
    
//     // Find current user
//     const currentUser = usersData.find(u => u.username === TEST_CONFIG.username);
//     expect(currentUser).toBeDefined();
    
//     // Validate user structure
//     expect(currentUser).toHaveProperty('id');
//     expect(currentUser).toHaveProperty('email');
//     expect(currentUser).toHaveProperty('username');
//     expect(currentUser.name).toHaveProperty('firstname');
//     expect(currentUser.name).toHaveProperty('lastname');
//     console.log('  ✅ User structure validated');
    
//     // ========================================================================
//     // Validate localStorage
//     // ========================================================================
//     console.log('  → Validating localStorage...');
    
//     await page.waitForURL('/');
    
//     const storedToken = await page.evaluate(() => localStorage.getItem('swmart_token'));
//     const storedUser = await getLocalStorageItem(page, 'swmart_user');
    
//     expect(storedToken).toBe(loginData.token);
//     expect(storedUser.username).toBe(TEST_CONFIG.username);
//     console.log('  ✅ localStorage validated');
    
//     console.log('✅ Login Page API validation passed!\n');
//   });

  
//   // ============================================================================
//   // TEST 3: Product Detail Page - Single Product API
//   // ============================================================================
//   base('should validate Product Detail Page API calls', async ({ page }) => {
//     console.log('\n🎯 TEST: Product Detail Page API Validation');
    
//     // Get products first
//     await page.goto('/');
//     await page.waitForSelector('.group');
    
//     // Get a product ID
//     const productsResponse = await waitForAPIResponse(page, '/products', 'GET');
//     const products = await productsResponse.json();
//     const testProductId = products[0].id;
    
//     console.log(`  → Testing product ID: ${testProductId}`);
//  // Navigate to product detail
//  await page.goto(`/products/${testProductId}`);
//  console.log(`  → Navigated to product detail page for product ID: ${testProductId}`);


//  const productResponse = await waitForAPIResponse(page, `/products/${testProductId}`, 'GET');
//  const productData = await productResponse.json();
//     // ========================================================================
//     // Validate Product API
//     // ========================================================================

//     console.log('  → Validating Product Detail API...');
    
//     expect(productData.id).toBe(testProductId);
//     expect(productData).toHaveProperty('title');
//     expect(productData).toHaveProperty('price');
//     console.log('  ✅ Product data validated');
    
//     // Validate UI
//   await expect(
//   page.getByRole('heading', { name: productData.title })
// ).toBeVisible();


//     console.log('  ✅ UI rendering validated');
    
//     console.log('✅ Product Detail Page API validation passed!\n');
//   });

  
//   // ============================================================================
//   // TEST 4: Cart Page - Cart API
//   // ============================================================================
//   base('should validate Cart Page API calls', async ({ page }) => {
//     console.log('\n🎯 TEST: Cart Page API Validation');
    
//     // Login first
//     const { loginResponse, usersResponse } = await loginUser(page);
//     const usersData = await usersResponse.json();

//     const usersStatus = usersResponse.status();
//     console.log(`  → Users API Status: ${usersStatus}`);

//     const loginStatus = loginResponse.status();
//     console.log(`  → login API Status: ${loginStatus}`);


//     const currentUser = usersData.find(u => u.username === TEST_CONFIG.username);
    
//     console.log(`  → Logged in as user ID: ${currentUser.id}`);
    
//     // Navigate to cart with optional cart API
//     const userCartsPromise = waitForAPIResponse(
//       page, 
//       `/carts/user/${currentUser.id}`, 
//       'GET',
//       { optional: true }
//     );
    
//     await page.goto('/cart');
//     await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
//     console.log('  ✅ Cart page loaded');
    
//     // Check if cart API was called
//     const userCartsResponse = await userCartsPromise;
    
//     if (userCartsResponse) {
//       const userCarts = await userCartsResponse.json();
//       expect(Array.isArray(userCarts)).toBe(true);
//       console.log(`  ✅ User Carts API returned ${userCarts.length} cart(s)`);
//     } else {
//       console.log('  ℹ️  No cart API call (empty cart)');
//     }
    
//     console.log('✅ Cart Page API validation passed!\n');
//   });

  
//   // ============================================================================
//   // TEST 5: Add to Cart - Operations
//   // ============================================================================
//   base('should validate Add to Cart operations', async ({ page }) => {
//     console.log('\n🎯 TEST: Add to Cart API Validation');
    
//     // Login
//     await loginUser(page);
    
//     // Go to homepage
//     await page.goto('/');
//     await page.waitForSelector('.group');
    
//     // Get first product
//     const firstProduct = page.locator('.group')
//       .filter({ has: page.locator('button:has-text("Add to Cart")') })
//       .first();
    
//     await firstProduct.scrollIntoViewIfNeeded();
//     const productName = await firstProduct.locator('h3').textContent();
    
//     console.log(`  → Adding: ${productName}`);
    
//     // Add to cart
//     await firstProduct.locator('button:has-text("Add to Cart")').click();
//     await page.waitForTimeout(1000);
    
 
//      await page.goto('/carts');
    
  

//  await page.goto('/cart');

// await expect(
//   page.getByText(productName, { exact: false })
// ).toBeVisible();


//     console.log(`  ✅ Cart has ${productName} item(s)`);
// });

  
//   // ============================================================================
//   // TEST 6: Checkout Page - Data Flow
//   // ============================================================================
//   base('should validate Checkout Page data flow', async ({ page }) => {
//     console.log('\n🎯 TEST: Checkout Page Validation');
    
//     // Login and add product
//     await loginUser(page);
    
//     await page.goto('/');
//     await page.waitForSelector('.group');
    
//     const firstProduct = page.locator('.group')
//       .filter({ has: page.locator('button:has-text("Add to Cart")') })
//       .first();
    
//     await firstProduct.locator('button:has-text("Add to Cart")').click();
//     await page.waitForTimeout(1000);
//     console.log('  ✅ Product added');
//      console.log('  ✅ ');
//     // Go to checkout
//     await page.goto('/cart');
//     await page.click('button:has-text("Proceed to Checkout")');
//       console.log(' gone to cart page ✅ ');
//     // Confirm modal
//     await expect(page.locator('[role="dialog"]')).toBeVisible();
//     await page.click('button:has-text("Confirm")');
    
//     await expect(page).toHaveURL(/.*checkout/);
//     console.log('  ✅ Checkout page loaded');
    
//     // Validate user data pre-filled
//     const firstNameValue = await page.getByLabel('First Name').inputValue();
//     const emailValue = await page.getByLabel('Email Address').inputValue();
    
//     expect(firstNameValue).toBeTruthy();
//     expect(emailValue).toBeTruthy();
//     console.log('  ✅ Form pre-filled with user data');
    
//     // Validate cart data
//     const cartData = await getLocalStorageItem(page, 'swmart_cart');
//     expect(cartData.length).toBeGreaterThan(0);
//     console.log(`  ✅ Cart has ${cartData.length} item(s) in checkout`);
    
//     console.log('✅ Checkout Page validation passed!\n');
//   });

  
//   // ============================================================================
//   // TEST 7: Complete User Flow
//   // ============================================================================
//   base('should validate complete user flow with all APIs', async ({ page }) => {
//     console.log('\n🎯 TEST: Complete Flow API Validation');
    
//     const apiCalls = {
//       login: false,
//       users: false,
//       products: false,
//       categories: false,
//       singleProduct: false,
//       userCarts: false,
//     };
    
//     // Track all API calls
//     page.on('response', response => {
//       const url = response.url();
//       if (url.includes('/auth/login')) apiCalls.login = true;
//       if (url.includes('/users') && !url.includes('/carts/user')) apiCalls.users = true;
//       if (url.includes('/products') && !url.includes('/products/')) apiCalls.products = true;
//       if (url.includes('/products/categories')) apiCalls.categories = true;
//       if (url.match(/\/products\/\d+$/)) apiCalls.singleProduct = true;
//       if (url.includes('/carts/user')) apiCalls.userCarts = true;
//     });
    
//     // Execute flow
//     console.log('  → Step 1: Homepage');
//     await page.goto('/');
//     await page.waitForSelector('.group');
    
//     console.log('  → Step 2: Login');
//     await page.click('text=LOGIN / SIGNUP');
//     await page.click('text=John Doe');
//     await page.waitForTimeout(500);
//     await page.click('button:has-text("Sign In")');
//     await page.waitForURL('/');
    
//     console.log('  → Step 3: Product Detail');

// // Click the first product card container directly
// const firstProduct = page.locator('.group')
//   .filter({ has: page.locator('button:has-text("Added to Cart")') })
//   .first();
//     await firstProduct.scrollIntoViewIfNeeded();

// await firstProduct.click();
// // Wait for navigation to product detail page
// await expect(page).toHaveURL(/\/products\/\d+$/);

    
//     console.log('  → Step 4: Add to Cart');
//        await page.goto('/');
//          const addProduct = page.locator('.group')
//       .filter({ has: page.locator('button:has-text("Add to Cart")') })
//       .first();
//       await addProduct.scrollIntoViewIfNeeded();
//       await addProduct.locator('button:has-text("Add to Cart")').click();
//       await page.waitForTimeout(1000);
    
//         console.log('  → Step 5: View Cart');
//         await page.click('[aria-label="Shopping cart"]');
//         await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    
//         console.log('  → Step 6: Checkout');
//         await page.click('button:has-text("Proceed to Checkout")');
//         await expect(page.locator('[role="dialog"]')).toBeVisible();
//         await page.click('button:has-text("Confirm")');
//         await expect(page).toHaveURL(/.*checkout/);
    
//     // Validate API calls
//     console.log('\n  📊 API Calls Summary:');
//     console.log(`  ${apiCalls.login ? '✅' : '❌'} Login API`);
//     console.log(`  ${apiCalls.users ? '✅' : '❌'} Users API`);
//     console.log(`  ${apiCalls.products ? '✅' : '❌'} Products API`);
//     console.log(`  ${apiCalls.categories ? '✅' : '❌'} Categories API`);
//     console.log(`  ${apiCalls.singleProduct ? '✅' : '❌'} Single Product API`);
//     console.log(`  ${apiCalls.userCarts ? '✅' : '⚠️ '} User Carts API (optional)`);
    
//     // Verify critical APIs
//     expect(apiCalls.login).toBe(true);
//     expect(apiCalls.users).toBe(true);
//     expect(apiCalls.products).toBe(true);
    
//     console.log('\n✅ Complete flow API validation passed!\n');
//   });
// });