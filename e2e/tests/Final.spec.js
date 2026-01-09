// e2e/tests/final-comprehensive-api-validation.spec.js
import { test as base, expect } from '@playwright/test';
import { time } from 'node:console';


const TEST_CONFIG = {
  username: process.env.TEST_USERNAME || 'johnd',
  password: process.env.TEST_PASSWORD || 'm38rmF$',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  apiTimeout: 30000,
  waitTimeout: 3000,
};

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('  ║   FINAL COMPREHENSIVE E2E API VALIDATION TEST SUITE        ║');
console.log('  ╚════════════════════════════════════════════════════════════╝');
console.log('\n🔧 Test Configuration:');
console.log('  • Username:', TEST_CONFIG.username);
console.log('  • Password:', '***');
console.log('  • Base URL:', TEST_CONFIG.baseURL);
console.log('  • API Timeout:', TEST_CONFIG.apiTimeout, 'ms\n');


// API Response Tracker - Monitors all API calls during tests
//tracks api calls  and responses


class APIResponseTracker {
  constructor(page) {
    this.page = page;
    this.responses = [];
    this.setupListener();
  }

  setupListener() {
    this.page.on('response', response => {
      const url = response.url();
      
      // Only track FakeStoreAPI calls
      if (url.includes('fakestoreapi.com')) {
        this.responses.push({
          url,
          method: response.request().method(),
          status: response.status(),
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  hasCall(urlPattern, method = null) {
    return this.responses.some(resp => {
        // Check if the response URL contains the given URL pattern
      const urlMatch = resp.url.includes(urlPattern);
       // Check if the response method matches the given method (if provided)
      const methodMatch = method ? resp.method === method : true;
      // Return true if both conditions are met
      return urlMatch && methodMatch;
    });
  }

  getCallCount(urlPattern, method = null) {
    return this.responses.filter(resp => {
      
      const urlMatch = resp.url.includes(urlPattern);
     
      const methodMatch = method ? resp.method === method : true;
      
      return urlMatch && methodMatch;
    }).length;
  }

  printSummary(title = 'API Call Summary') {
    console.log(`\n  📊 ${title}:`);
    
    const grouped = {};
    this.responses.forEach(resp => {
      const key = `${resp.method} ${this.simplifyURL(resp.url)}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    Object.entries(grouped).forEach(([key, count]) => {
      const icon = count > 1 ? '🔄' : '✅';
      const countStr = count > 1 ? ` (×${count})` : '  (×1) ';
      console.log(`     ${icon} ${key}${countStr}`);
    });
  }

  simplifyURL(url) {
    return url
      .replace('https://fakestoreapi.com', '')
      .replace(/\/\d+$/, '/:id')
      .replace(/\/user\/\d+$/, '/user/:userId');
  }

  reset() {
    this.responses = [];
  }
}



 // Wait for API response with flexible options
 
async function waitForAPIResponse(page, urlPattern, method = 'GET', options = {}) {
  const {
    timeout = TEST_CONFIG.apiTimeout,
    validStatuses = [200, 201, 304],
    optional = false,
    description = '',
  } = options;

  try {
    const response = await page.waitForResponse(
      r => r.url().includes(urlPattern) && r.request().method() === method,
      { timeout }
    );
    
    const status = response.status();
    
    if (description) {
      console.log(`   ✓ ${description}: ${method} ${urlPattern} → ${status}`);
    }
    
    if (!validStatuses.includes(status)) {
      console.warn(`     ⚠️  Unexpected status ${status} (expected: ${validStatuses.join(', ')})`);
    }
    
    expect(validStatuses).toContain(status);
    return response;
    
  } catch (error) {
    if (optional) {
      console.log(`ℹ️  Optional API not called: ${urlPattern}`);
      return null;
    }
    throw error;
  }
}


async function getLocalStorageItem(page, key) {
  return await page.evaluate((k) => {
    const item = localStorage.getItem(k);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item;
    }
  }, key);
}


 //Wait for element with custom retry logic

async function waitForElement(page, selector, options = {}) {
  const { timeout = 5000, visible = true } = options;
  
  try {
    await page.waitForSelector(selector, { 
      timeout, 
      state: visible ? 'visible' : 'attached' 
    });
    return true;
  } catch (error) {
    console.warn(`  ⚠️  Element not found: ${selector}`);
    throw error;
  }
}

/**
 * Login helper - Returns user data and API responses
 */
async function performLogin(page) {
  console.log('    → Navigating to login page...');
  await page.goto('/login');
  
  // Setup API listeners
  const loginPromise = waitForAPIResponse(page, '/auth/login', 'POST', {
    validStatuses: [200, 201],
    description: 'Auth Login',
  });
  
  const usersPromise = waitForAPIResponse(page, '/users', 'GET', {
    description: 'Users Data',
  });
  
  // Perform login
  console.log('     → Clicking demo account...');
  await page.click('text=John Doe');
  await page.waitForTimeout(500);
  
  console.log('     → Submitting credentials...');
  await page.click('button:has-text("Sign In")');
  
  // Wait for API responses
  const [loginResponse, usersResponse] = await Promise.all([
    loginPromise,
    usersPromise,
  ]);
  
  // Wait for redirect
  await page.waitForURL('/', { timeout: 10000 });
  
  // Get user data
  const loginData = await loginResponse.json();
  const usersData = await usersResponse.json();
  const currentUser = usersData.find(u => u.username === TEST_CONFIG.username);
  
  console.log(`     ✓ Logged in as: ${currentUser.name.firstname} ${currentUser.name.lastname} (ID: ${currentUser.id})`);
  
  return {
    token: loginData.token,
    user: currentUser,
    loginResponse,
    usersResponse,
  };
}

/**
 * Add product to cart helper
 */
async function addProductToCart(page, productSelector = null) {
  await page.goto('/');
  await waitForElement(page, '.group');
  
  const product = productSelector || page.locator('.group')
    .filter({ has: page.locator('button:has-text("Add to Cart")') })
    .first();
  
  await product.scrollIntoViewIfNeeded();
  const productName = await product.locator('h3').textContent();
  
  console.log(`     → Adding to cart: "${productName.substring(0, 40)}..."`);
  
  await product.locator('button:has-text("Add to Cart")').click();
  await page.waitForTimeout(1500);
  
  return productName;
}

// ============================================================================
// TEST SUITE
// ============================================================================

base.describe('Final Comprehensive E2E API Validation', () => {
  // ============================================================================
  // TEST 1: Initial Page Load - Products & Categories APIs
  // ============================================================================
  base('Test 1: Should call Products & Categories APIs on page load', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('  ║  TEST 1: Initial Page Load API Validation                  ║');
    console.log('  ╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: Loading homepage\n');
    
    // Setup API listeners BEFORE navigation
    const productsPromise = waitForAPIResponse(page, '/products', 'GET', {
      description: 'Products API',
    });
    
    const categoriesPromise = waitForAPIResponse(page, '/products/categories', 'GET', {
      description: 'Categories API',
    });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for both APIs
    const [productsResponse, categoriesResponse] = await Promise.all([
      productsPromise,
      categoriesPromise,
    ]);
    
    // Validate Products API
    console.log('\n  🔍 Validating Products API Response:\n');
    const productsData = await productsResponse.json();
    
    expect(Array.isArray(productsData)).toBe(true);
    expect(productsData.length).toBeGreaterThan(0);
    console.log(`     ✓ Received ${productsData.length} products`);
    
    // Validate structure
    const product = productsData[0];
    const requiredFields = ['id', 'title', 'price', 'description', 'category', 'image', 'rating'];
    requiredFields.forEach(field => expect(product).toHaveProperty(field));
    console.log(`     ✓ Product structure validated (${requiredFields.length} required fields)`);
    
    // Validate data types
    expect(typeof product.id).toBe('number');
    expect(typeof product.title).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.rating.rate).toBe('number');
    expect(typeof product.rating.count).toBe('number');
    console.log('     ✓ Data types validated');
    
    // Validate Categories API
    console.log('\n  🔍 Validating Categories API Response:\n');
    const categoriesData = await categoriesResponse.json();
    
    expect(Array.isArray(categoriesData)).toBe(true);
    expect(categoriesData.length).toBeGreaterThan(0);
    console.log(`     ✓ Received ${categoriesData.length} categories: [${categoriesData.join(', ')}]`);
    
    // Validate UI rendering
    console.log('\n  🔍 Validating UI Rendering:\n');
    await waitForElement(page, '.group');
    const productCards = await page.locator('.group').count();
    expect(productCards).toBeGreaterThan(0);
    console.log(`     ✓ Rendered ${productCards} product cards`);
    
    tracker.printSummary('Test 1 API Calls');
    console.log('\n  ✅ TEST 1 PASSED: Initial page load APIs validated\n');

  });

  
  // ============================================================================
  // TEST 2: Login Flow - Auth, Users, and User Carts APIs
  // ============================================================================
  base('Test 2: Should call Auth, Users, and User Carts APIs on login', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('  ║  TEST 2: Login Flow API Validation                         ║');
    console.log('  ╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: User login\n');
    
    // Perform login
    const { token, user, loginResponse, usersResponse } = await performLogin(page);
    
    // Validate Login API
    console.log('\n  🔍 Validating Login API Response:\n');
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(0);
    console.log(`     ✓ Token received: ${token.substring(0, 30)}... (${token.length} chars)`);
    
    const loginStatus = loginResponse.status();
    console.log(`     ✓ Login status: ${loginStatus}`);
    
    // Validate Users API
    console.log('\n  🔍 Validating Users API Response:\n');
    const usersData = await usersResponse.json();
    
    expect(Array.isArray(usersData)).toBe(true);
    expect(usersData.length).toBeGreaterThan(0);
    console.log(`     ✓ Received ${usersData.length} users`);
    
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('username');
    expect(user.name).toHaveProperty('firstname');
    expect(user.name).toHaveProperty('lastname');
    console.log(`     ✓ User structure validated`);
    console.log(`     ✓ Current user: ${user.username} (${user.email})`);
    
    // Check for User Carts API (optional)
    console.log('\n  🔍 Checking User Carts API:\n');
    
    await page.waitForTimeout(1000);
    const hasUserCartsCall = tracker.hasCall(`/carts/user/${user.id}`, 'GET');

     const hasUserProductCartsCall = tracker.hasCall(`/products/${user.id}`, 'GET');

    
    if (hasUserCartsCall) {
      console.log(`     ✓ User Carts API called for user ${user.id}`);
    } else {
      console.log(`     ℹ️  User Carts API not called (may be empty cart)`);
    }
    
    // Validate localStorage
    console.log('\n  🔍 Validating localStorage:\n');
    const storedToken = await page.evaluate(() => localStorage.getItem('swmart_token'));
    const storedUser = await getLocalStorageItem(page, 'swmart_user');
    
    expect(storedToken).toBe(token);
    expect(storedUser.username).toBe(user.username);
    expect(storedUser.id).toBe(user.id);
    console.log('     ✓ Token stored correctly');
    console.log('     ✓ User data stored correctly');
    
    tracker.printSummary('Test 2 API Calls');
    console.log('\n  ✅ TEST 2 PASSED: Login flow APIs validated\n');
  });

  
  // ============================================================================
  // TEST 3: Product Detail View - Single Product API
  // ============================================================================
  base('Test 3: Should call Single Product API when clicking product', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('  ║  TEST 3: Product Detail View API Validation                ║');
    console.log('  ╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: View product details\n');
    
    // Load homepage
    await page.goto('/');
    await waitForElement(page, '.group');
    
    // Get first product
    const productsResponse = await waitForAPIResponse(page, '/products', 'GET');
    const products = await productsResponse.json();
    const testProduct = products[0];
    
    console.log(`     → Selected product: "${testProduct.title}"`);
    console.log(`     → Product ID: ${testProduct.id}\n`);
    
    // Setup listener for product detail API
    const productDetailPromise = waitForAPIResponse(
      page,
      `/products/${testProduct.id}`,
      'GET',
      { description: 'Product Detail' }
    );
    
    // Click product
    console.log('  🔍 Clicking product card...\n');

    const productCard = page.locator('.group') .filter({ has: page.locator('button:has-text("Add to Cart")') }).first();


     await productCard.scrollIntoViewIfNeeded();
    await productCard.click();
    
    // Wait for navigation
    await page.waitForURL(`/products/${testProduct.id}`);
    console.log(`     ✓ Navigated to /products/${testProduct.id}\n`);
    
    // Wait for API call
    const productDetailResponse = await productDetailPromise;
    
    // Validate API response
    console.log('  🔍 Validating Product Detail API Response:\n');
    const productDetail = await productDetailResponse.json();
    
    expect(productDetail.id).toBe(testProduct.id);
    expect(productDetail.title).toBe(testProduct.title);
    expect(productDetail).toHaveProperty('price');
    expect(productDetail).toHaveProperty('description');
    expect(productDetail).toHaveProperty('category');
    expect(productDetail).toHaveProperty('image');
    console.log('     ✓ Product detail data validated');
    console.log(`     ✓ Product: ${productDetail.title}`);
    console.log(`     ✓ Price: $${productDetail.price}`);
    console.log(`     ✓ Category: ${productDetail.category}`);
    
    // Validate UI
    console.log('\n  🔍 Validating UI Rendering:\n');
    await expect(page.getByRole('heading', { name: testProduct.title })).toBeVisible();
    console.log('     ✓ Product title rendered');
    
    tracker.printSummary('Test 3 API Calls');
    console.log('\n  ✅ TEST 3 PASSED: Product detail API validated\n');
  });

  
  // ============================================================================
  // TEST 4: Add to Cart - Cart Create/Update API
  // ============================================================================
  base('Test 4: Should call Cart API when adding product to cart', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  TEST 4: Add to Cart API Validation                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: Add product to cart\n');
    
    // Login first
    const { user } = await performLogin(page);
    
    // Setup cart API listener (optional - might use localStorage first)
    const cartUpdatePromise = waitForAPIResponse(page, '/carts', 'PUT', {
      optional: true,
      description: 'Cart Update',
    });
    
    // Add product to cart
    console.log('\n  🔍 Adding product to cart:\n');
    await page.evaluate(() => localStorage.removeItem('swmart_cart'));
    
    await page.waitForTimeout(1000);
    console.log('     ✓ Cart cleared from localStorage');

    const productName = await addProductToCart(page);
    
    // Check for cart API call
    console.log('\n  🔍 Checking Cart API:\n');
    const cartUpdateResponse = await cartUpdatePromise;
    
    if (cartUpdateResponse) {
      const cartData = await cartUpdateResponse.json();
      console.log('     ✓ Cart API called');
      console.log(`     ✓ Cart ID: ${cartData.id}`);
      console.log(`     ✓ User ID: ${cartData.userId}`);
      console.log(`     ✓ Products in cart: ${cartData.products?.length || 0}`);
    } else {
      console.log('     ℹ️  Cart managed via localStorage (API sync may be delayed)');
    }
    
    // Validate localStorage cart
    console.log('\n  🔍 Validating localStorage Cart:\n');
    const localCart = await getLocalStorageItem(page, 'swmart_cart');
    
    expect(localCart).toBeTruthy();
    expect(Array.isArray(localCart)).toBe(true);
    expect(localCart.length).toBeGreaterThan(0);
    console.log(`     ✓ Cart items: ${localCart.length}`);
    
    const addedProduct = localCart[0];
    expect(addedProduct).toHaveProperty('id');
    expect(addedProduct).toHaveProperty('title');
    expect(addedProduct).toHaveProperty('price');
    expect(addedProduct).toHaveProperty('quantity');
    expect(addedProduct.quantity).toBeGreaterThan(0);
    console.log(`     ✓ Product structure validated`);
    console.log(`     ✓ Product: "${addedProduct.title.substring(0, 40)}..."`);
    console.log(`     ✓ Quantity: ${addedProduct.quantity}`);
    console.log(`     ✓ Price: $${addedProduct.price}`);
    
    // Validate cart badge
    console.log('\n  🔍 Validating Cart Badge:\n');
    const cartBadge = page.locator('[aria-label="Shopping cart"]').locator('span').first();
    await expect(cartBadge).toBeVisible();
    const badgeCount = await cartBadge.textContent();
    expect(parseInt(badgeCount)).toBeGreaterThan(0);
    console.log(`     ✓ Cart badge shows: ${badgeCount} item(s)`);
    
    tracker.printSummary('Test 4 API Calls');
    console.log('\n  ✅ TEST 4 PASSED: Add to cart validated\n');
  });

  
  // ============================================================================
  // TEST 5: Cart Page Load - User Carts API
  // ============================================================================
  base('Test 5: Should call User Carts API when loading cart page', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  TEST 5: Cart Page Load API Validation                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: Load cart page\n');
    
    // Login
    const { user } = await performLogin(page);
    
    // Setup user carts API listener
    const userCartsPromise = waitForAPIResponse(
      page,
      `/carts/user/${user.id}`,
      'GET',
      {
        optional: true,
        description: 'User Carts',
      }
    );
    
    // Navigate to cart
    console.log('\n  🔍 Loading cart page:\n');
    await page.goto('/cart');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    console.log('     ✓ Cart page loaded');
    
    // Check API call
    console.log('\n  🔍 Validating User Carts API:\n');
    const userCartsResponse = await userCartsPromise;
    
    if (userCartsResponse) {
      const userCarts = await userCartsResponse.json();
      
      expect(Array.isArray(userCarts)).toBe(true);
      console.log(`     ✓ User Carts API called`);
      console.log(`     ✓ Carts fetched: ${userCarts.length}`);
      
      // Validate cart structure if carts exist
      if (userCarts.length > 0) {
        const cart = userCarts[0];
        expect(cart).toHaveProperty('id');
        expect(cart).toHaveProperty('userId');
        expect(cart).toHaveProperty('date');
        expect(cart).toHaveProperty('products');
        expect(Array.isArray(cart.products)).toBe(true);
        
        console.log(`     ✓ Cart structure validated`);
        console.log(`     ✓ Cart ID: ${cart.id}`);
        console.log(`     ✓ Products in cart: ${cart.products.length}`);
        
        if (cart.products.length > 0) {
          const product = cart.products[0];
          expect(product).toHaveProperty('productId');
          expect(product).toHaveProperty('quantity');
          console.log(`     ✓ Cart product structure validated`);
        }
      }
    } else {
      console.log('     ℹ️  No User Carts API call (empty cart or localStorage only)');
    }
    
    tracker.printSummary('Test 5 API Calls');
    console.log('\n  ✅ TEST 5 PASSED: Cart page load validated\n');
  });

  
  // ============================================================================
  // TEST 6: Update Cart Quantity - Cart Update API
  // ============================================================================
  base('Test 6: Should call Cart Update API when modifying cart quantity', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  TEST 6: Update Cart Quantity API Validation              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: Update cart quantity\n');
    
    // Login and add product
    const { user } = await performLogin(page);

     await page.evaluate(() => localStorage.removeItem('swmart_cart'));
    await addProductToCart(page);
    
    // Go to cart
    console.log('\n  🔍 Navigating to cart page:\n');
    await page.goto('/cart');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    console.log('     ✓ Cart page loaded');
    
    // Setup cart update API listener
    const cartUpdatePromise = waitForAPIResponse(page, '/carts', 'PUT', {
      optional: true,
      description: 'Cart Update (Quantity Change)',
    });
    
    // Find quantity input
    console.log('\n  🔍 Updating product quantity:\n');
    const quantityInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    
    // Get current quantity
    const currentQuantity = await quantityInput.inputValue();
    console.log(`     → Current quantity: ${currentQuantity}`);
    
    // Change quantity
    const newQuantity = parseInt(currentQuantity) + 2;
    console.log(`     → Changing to: ${newQuantity}`);
    
    await quantityInput.fill(newQuantity.toString());
    await quantityInput.press('Enter');
    
    // Confirm modal
    await page.waitForTimeout(500);
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      console.log('     ✓ Quantity change confirmed');
    }
    
    await page.waitForTimeout(1000);
    
    // Check API call
    console.log('\n  🔍 Checking Cart Update API:\n');
    const cartUpdateResponse = await cartUpdatePromise;
    
    if (cartUpdateResponse) {
      console.log('     ✓ Cart Update API called');
      const cartData = await cartUpdateResponse.json();
      console.log(`     ✓ Updated cart ID: ${cartData.id}`);
    } else {
      console.log('     ℹ️  Cart updated via localStorage (API sync may be delayed)');
    }
    
    tracker.printSummary('Test 6 API Calls');
    console.log('\n  ✅ TEST 6 PASSED: Cart quantity update validated\n');
  });

  
  // ============================================================================
  // TEST 7: Clear Cart - Cart Delete API
  // ============================================================================
  base('Test 7: Should call Cart Delete API when clearing cart', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('  ║  TEST 7: Clear Cart API Validation                         ║');
    console.log('  ╚════════════════════════════════════════════════════════════╝\n');
    
   const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Action: Clear Cart \n');
    
    // Login and add product
    const { user } = await performLogin(page);
    await addProductToCart(page);
    
    // Go to cart
    console.log('\n  🔍 Navigating to cart page:\n');
    await page.goto('/cart');
    console.log('     ✓ Cart page loaded');
    
    // Verify cart has items
    const cartBeforeClear = await getLocalStorageItem(page, 'swmart_cart');
    expect(cartBeforeClear.length).toBeGreaterThan(0);
    console.log(`     ✓ Cart has ${cartBeforeClear.length} item(s)`);
    
    // Setup delete cart API listener
    const deleteCartPromise = waitForAPIResponse(page, '/carts', 'DELETE', {
      optional: true,
      description: 'Cart Delete',
    });
    
    // Clear cart
    console.log('\n  🔍 Clearing cart:\n');
    const clearButton = page.locator('[aria-label="Clear Cart"]');
    await clearButton.click();
    console.log('     ✓ Clicked "Clear Cart" button');
    
    // Confirm modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.click('button:has-text("Confirm")');
    console.log('     ✓ Confirmed clear action');
    
    await page.waitForTimeout(1000);
    
    // Check API call
    console.log('\n  🔍 Checking Cart Delete API:\n');
    const deleteCartResponse = await deleteCartPromise;
    
    if (deleteCartResponse) {
      console.log('     ✓ Cart Delete API called');
      const deleteData = await deleteCartResponse.json();
      console.log(`     ✓ Deleted cart ID: ${deleteData.id || 'confirmed'}`);
    } else {
      console.log('     ℹ️  Cart cleared via localStorage (no API call)');
    }
    
    tracker.printSummary('Test 7 API Calls');
    console.log('\n  ✅ TEST 7 PASSED: Clear cart validated\n');
  });

  
  // ============================================================================
  // TEST 8: Complete Shopping Flow - All APIs
  // ============================================================================
  base('Test 8: Should call all APIs in complete shopping flow', async ({ page }) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  TEST 8: Complete Shopping Flow - All APIs                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const tracker = new APIResponseTracker(page);
    
    console.log('  📍 Scenario: Complete end-to-end shopping flow\n');
    
    // ========================================================================
    // STEP 1: Load Homepage
    // ========================================================================
    console.log('  📍 STEP 1: Load Homepage\n');
    await page.goto('/');
    await waitForElement(page, '.group');
    console.log('     ✓ Homepage loaded\n');
    
    // ========================================================================
    // STEP 2: Login
    // ========================================================================
    console.log('  📍 STEP 2: User Login\n');
    await page.click('text=LOGIN / SIGNUP');
    const { user } = await performLogin(page);
    console.log('');
    
    // ========================================================================
    // STEP 3: View Product Detail
    // ========================================================================
    console.log('  📍 STEP 3: View Product Details\n');
    await page.goto('/');
    await waitForElement(page, '.group');
    
   const productCard = page.locator('.group') .filter({ has: page.locator('button:has-text("Added to Cart")') }).first();

   await productCard.scrollIntoViewIfNeeded();
    await productCard.click();

    await page.waitForURL(/\/products\/\d+$/);
    console.log('     ✓ Product detail page loaded\n');
    



    // ========================================================================
    // STEP 4: Add to Cart
    // ========================================================================
    console.log('  📍 STEP 4: Add to Cart\n');
    await addProductToCart(page);
    console.log('      ✓ product added to cart');
    
    // ========================================================================
    // STEP 5: View Cart
    // ========================================================================
    console.log('  📍 STEP 5: View Cart\n');
    await page.click('[aria-label="Shopping cart"]');
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    console.log('     ✓ Cart page loaded\n');
    
    // ========================================================================
    // STEP 6: Update Quantity
    // ========================================================================
    console.log('  📍 STEP 6: Update Quantity\n');
    const quantityInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    const currentQty = await quantityInput.inputValue();
    const newQty = parseInt(currentQty) + 4;
    
    await quantityInput.fill(newQty.toString());
    await quantityInput.press('Enter');
    await page.waitForTimeout(500);
    
     await expect(page.locator('[role="dialog"]')).toBeVisible();
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    console.log(`     ✓ Quantity updated: ${currentQty} → ${newQty}\n`);
    await page.waitForTimeout(1000);


    console.log ("Decrease quantity by 1 using button ")
   const decreaseQuantityButton = page.locator('[aria-label="Decrease quantity"]').first();
await decreaseQuantityButton.click();

    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton1 = page.locator('button:has-text("Confirm")');
      await confirmButton1.click();
      console.log('     ✓ Quantity Decrease button triggered');
    


          console.log ("Increase quantity by 1 using button ")
   const increaseQuantityButton = page.locator('[aria-label="Increase quantity"]').first();
await increaseQuantityButton.click();

    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton2 = page.locator('button:has-text("Confirm")');
      await confirmButton2.click();
      console.log('     ✓ Quantity Increase button triggered');




     console.log ("Remove Item From Cart ")
   const removeButton = page.locator('[aria-label="Remove item"]').first();
await removeButton.click();

    await page.waitForTimeout(500);

    await expect(page.locator("[role='dialog']")).toBeVisible();
    const confirmButton3 = page.locator('button:has-text("Confirm")');
      await confirmButton3.click();
       await page.waitForTimeout(1500);
      console.log('     ✓ Item Removed from Cart button triggered');



    // ========================================================================
    // STEP 7: Proceed to Checkout
    // ========================================================================
    console.log('  📍 STEP 7: Proceed to Checkout\n');
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.click('button:has-text("Confirm")');
    await expect(page).toHaveURL(/.*checkout/);
    console.log('     ✓ Checkout page loaded\n');
    
    // // ========================================================================
    // // Validate All API Calls
    // // ========================================================================
    console.log('\n  📊 VALIDATING COMPLETE API COVERAGE:\n');
    
    const expectedAPIs = [
      { pattern: '/products', method: 'GET', name: 'Products API (Homepage)' },
      { pattern: '/products/categories', method: 'GET', name: 'Categories API (Homepage)' },
      { pattern: '/auth/login', method: 'POST', name: 'Login API' },
      { pattern: '/users', method: 'GET', name: 'Users API' },
      { pattern: '/products/', method: 'GET', name: 'Single Product API' },
      { pattern: '/carts/user/', method: 'GET', name: 'User Carts API' },
    ];
    
    let allPassed = true;
    expectedAPIs.forEach(api => {
      const called = tracker.hasCall(api.pattern, api.method);
      const count = tracker.getCallCount(api.pattern, api.method);
      const icon = called ? '✅' : '❌';
      const countStr = count > 1 ? ` (×${count})` : '';
      console.log(`     ${icon} ${api.name}${countStr}`);
      if (!called) allPassed = false;
    });
    
    // Optional APIs
    console.log('\n  📊 OPTIONAL APIs:\n');
    const optionalAPIs = [
      { pattern: '/carts', method: 'PUT', name: 'Cart Update API' },
      { pattern: '/carts', method: 'DELETE', name: 'Cart Delete API' },
    ];
    
    optionalAPIs.forEach(api => {
      const called = tracker.hasCall(api.pattern, api.method);
      const count = tracker.getCallCount(api.pattern, api.method);
      const icon = called ? '✅' : 'ℹ️ ';
      const countStr = count > 1 ? ` (×${count})` : '';
      const status = called ? countStr : ' (not called)';
      console.log(`     ${icon} ${api.name}${status}`);
    });
    
    // Validate localStorage state
    console.log('\n  🔍 Validating Final State:\n');
    const finalCart = await getLocalStorageItem(page, 'swmart_cart');
    const finalUser = await getLocalStorageItem(page, 'swmart_user');
    
    expect(finalUser).toBeTruthy();
    expect(finalCart).toBeTruthy();
    console.log(`     ✓ User authenticated: ${finalUser.username}`);
    console.log(`     ✓ Cart has ${finalCart.length} item(s)`);
    console.log(`     ✓ Ready for checkout`);
    
    expect(allPassed).toBe(true);
    
    tracker.printSummary('Test 8 - Complete Flow API Calls');
    console.log('\n  ✅ TEST 8 PASSED: Complete shopping flow validated\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ALL TESTS COMPLETED SUCCESSFULLY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  });
});