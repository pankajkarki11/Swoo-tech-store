import { test, expect } from '@playwright/test';


test.describe('Complete Shopping Flow', () => {
  
  // Run before each test
  test.beforeEach(async ({ page }) => {
        ///for firefox


     await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Navigate to home page
    // await page.goto('/');
  });

  test('should complete full shopping journey from login to checkout', async ({ page }) => {
    
    // STEP 1: Navigate to Login Page

    console.log('Step 1: Navigate to Login Page');
    
    await page.click('text=LOGIN / SIGNUP');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1:has-text("LOGIN")')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/01-login-page.png' });

    

    // STEP 2: Login with Demo Account

  
    console.log('Step 2: Login with Demo Account');
    
    await page.click('text=John Doe');
    await page.waitForTimeout(500);
    
    //Verify credentials are filled
    const usernameInput = page.locator('input[placeholder*="username"]');
    const passwordInput = page.locator('input[placeholder*="password"]');
    
    await expect(usernameInput).toHaveValue('johnd');
    await expect(passwordInput).toHaveValue('m38rmF$');
    
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('/');
    
    await expect(page.locator('text=John')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/02-logged-in.png' });

    
    // STEP 3: Browse Products

    console.log(' Step 3: Browse Products');
    
    // Wait for products to load
    await page.waitForSelector('.group', { timeout: 5000 }); // Product card
    
    // Verify products are displayed
    const productCards = await page.locator('.group').count();
    expect(productCards).toBeGreaterThan(0);
    
    console.log(`   ✓ Found ${productCards} products`);
    
    await page.screenshot({ path: 'screenshots/03-products-page.png' });

    
   
    // STEP 4: Add Product to Cart
   
    console.log(' Step 4: Add Product to Cart');
    
    const firstProduct = page.locator('.group').filter({has: page.locator('button:has-text("Add to Cart")')}).first();
    await firstProduct.scrollIntoViewIfNeeded();
    
    // Get product name for verification later
    const productName = await firstProduct.locator('h3').textContent();
    console.log(`   → Adding "${productName}" to cart`);
    
    await firstProduct.locator('button:has-text("Add to Cart")').click();
    
   // Wait for toast using regex (dynamic product name)
    await expect(page.locator(`text=/${productName}.*added to cart/i`)).toBeVisible({ timeout: 2000 });
    
    // Verify cart badge shows "1"
    await expect(page.locator('text=1').first()).toBeVisible();
    
    console.log(`  ✓${productName} added to cart`);
    
    await page.screenshot({ path: 'screenshots/04-product-added.png' });

       /////////////////////
    // STEP 5: View Cart
    //////////////////////////////////


    console.log('📍 Step 5: View Cart');
    
    // Click on cart icon
    await page.click('[aria-label="Shopping cart"]');
    
    // Wait for cart page
    await expect(page).toHaveURL(/.*cart/);
    
    // Verify cart heading
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    
    // Verify product is in cart
    const cartProductLocator = page.locator('.group').filter({has: page.locator(`h3:has-text("${productName}")`)});

    await expect(cartProductLocator).toBeVisible();

    
    // Verify cart shows 1 item
    await expect(page.locator('text=/items in your cart/i')).toBeVisible();
    
    // Verify order summary exists
    await expect(page.locator('text=Order Summary')).toBeVisible();
    
    console.log('  ✓ Cart page displayed correctly');
    
    await page.screenshot({ path: 'screenshots/05-cart-page.png' });

    // ========================================================================
    // STEP 6: Proceed to Checkout
    // ========================================================================

    console.log(' Step 6: Proceed to Checkout');
    
    // Click "Proceed to Checkout" button
    await page.click('button:has-text("Proceed to Checkout")');
    
    // Confirm in modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.click('button:has-text("Confirm")');
    
    // Wait for checkout page
    await expect(page).toHaveURL(/.*checkout/);
    
    // Verify checkout heading
    await expect(page.locator('h1:has-text("Checkout")')).toBeVisible();
    
    console.log('   ✓ Checkout page loaded');
    
    await page.screenshot({ path: 'screenshots/06-checkout-page.png' });

    
    // ========================================================================
    // STEP 7: Fill Checkout Form
    // ========================================================================
    console.log(' Step 7: Fill Checkout Form');
    
    
    // Fill payment details
    await page.fill('[aria-label="State"]', 'CA');
    await page.fill('[aria-label="Card Number"]', '4532015112830366');
    await page.fill('[aria-label="Name on Card"]', 'John Doe');
    await page.fill('[aria-label="Expiry Date"]', '12/25');
    await page.fill('[aria-label="CVV"]', '123');
    
    // Check terms and conditions
    await page.check('input[type="checkbox"][id="terms"]');
    
    console.log('   ✓ Checkout form filled');
    
    await page.screenshot({ path: 'screenshots/07-checkout-filled.png' });

    
    // ========================================================================
    // STEP 8: Place Order
    // ========================================================================
    console.log('Step 8: Place Order');
    
    await page.click('button:has-text("Place Order")');
    
   
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Confirm Order')).toBeVisible();
    
    await page.click('button:has-text("Place Order")');
    
    console.log('   ✓ Order placed');

    
    // ========================================================================
    // STEP 9: Verify Order Confirmation
    // ========================================================================
    console.log(' Step 9: Verify Order Confirmation');
    
    // Wait for success page
    await expect(page.locator('text=Order Confirmed')).toBeVisible({ timeout: 5000 });
    
    // Verify success message
    await expect(page.locator('text=Thank you for your purchase')).toBeVisible();
    
    // Verify order summary
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=Items')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/08-order-confirmed.png' });

    
 
    console.log('✅ Complete shopping flow test passed!');
  });

  
  // ==========================================================================
  // ADDITIONAL TEST: Error Handling
  // ==========================================================================
  test('should handle checkout with empty cart', async ({ page }) => {
    console.log('📍 Testing: Empty Cart Error Handling');
    
    // Login first
    await page.click('text=LOGIN / SIGNUP');
    await page.click('text=John Doe');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/');
    
    // Navigate to cart
    await page.click('[aria-label="Shopping cart"]');


    //as we automatically fetch items in cart during login
    await page.click('[aria-label="Clear Cart"]');

    await expect(page.locator('[role="dialog"]')).toBeVisible();
     await page.click('button:has-text("Confirm")');
    

    // Cart should be empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    
    // Try to checkout
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeDisabled();
    
    
    console.log('  📍📍📍📍📍 ✓ Empty cart error handled correctly📍📍📍📍');

     await page.screenshot({ path: 'screenshots/09-Empty-Cart.png' });
  });

 
  // ==========================================================================
  // ADDITIONAL TEST: Add Multiple Products
  // ==========================================================================
  test('should add multiple products to cart', async ({ page }) => {
    console.log('📍 Testing: Add Multiple Products');
    
    // Login
    await page.click('text=LOGIN / SIGNUP');
    await page.click('text=John Doe');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/');
    
    // Wait for products
    await page.waitForSelector('.group');




    
    const firstProduct = page.locator('.group').filter({has: page.locator('button:has-text("Add to Cart")')}).first();
    await firstProduct.scrollIntoViewIfNeeded();
    
    // Get product name for verification later
    const productName = await firstProduct.locator('h3').textContent();
    console.log(`📍📍📍📍📍📍📍📍📍📍📍   → Adding "${productName}" to cart`);
    
    await firstProduct.locator('button:has-text("Add to Cart")').click();



    const secondProduct = page.locator('.group').filter({has: page.locator('button:has-text("Add to Cart")')}).first();
    await secondProduct.scrollIntoViewIfNeeded();
    
    // Get product name for verification later
    const productName2 = await secondProduct.locator('h3').textContent();
    console.log(`📍📍📍📍📍📍📍📍📍📍📍   → Adding "${productName2}" to cart`);
    
    await secondProduct.locator('button:has-text("Add to Cart")').click();



    const thirdProduct = page.locator('.group').filter({has: page.locator('button:has-text("Add to Cart")')}).first();
    await thirdProduct.scrollIntoViewIfNeeded();
    
    // Get product name for verification later
    const productName3 = await thirdProduct.locator('h3').textContent();
    console.log(`📍📍📍📍📍📍📍📍📍📍📍   → Adding "${productName3}" to cart`);
    
    await thirdProduct.locator('button:has-text("Add to Cart")').click();
    

    // Go to cart
    await page.click('[aria-label="Shopping cart"]');
    
    // Verify all items in cart
    await expect(page.locator(`text=/ items in your cart/i`)).toBeVisible();
    
    console.log('   ✓ All products displayed in cart');
  });
});