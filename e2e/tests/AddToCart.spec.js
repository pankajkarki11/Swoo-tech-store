import { test as base, expect } from '@playwright/test';

const TEST_CONFIG = {
  username: process.env.TEST_USERNAME || 'johnd',
  password: process.env.TEST_PASSWORD || 'm38rmF$',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  apiTimeout: 30000,
  waitTimeout: 3000,
};

console.log(' ////////   FINAL COMPREHENSIVE E2E API VALIDATION TEST SUITE  //////////');
console.log('  • Username:', TEST_CONFIG.username);
console.log('  • Base URL:', TEST_CONFIG.baseURL);

// API Response Tracker - Monitors all API calls during tests
//tracks api calls  and responses
class APIResponseTracker {
  constructor(page, options = {}) {
    this.page = page;
    this.responses = [];
    this.errors = [];
    this.maxResponses = options.maxResponses || 1000; // Prevent memory leaks
    this.captureBody = options.captureBody !== false; // Default: true
    this.setupListener();
  }

  setupListener() {
    // Track responses
    this.page.on('response', async (response) => {
      
      try {
        const url = response.url();
        const request = response.request();
        // Only track FakeStoreAPI calls
        if (
      !url.includes('fakestoreapi.com') ||
      !['xhr', 'fetch'].includes(request.resourceType())
    ) {
      return;
    }

        const status = response.status();
        const method = response.request().method();
        
        const entry = {
          url,
          method,
          status,
          timestamp: new Date().toISOString(),
          headers: response.headers(),
          isOk: response.ok(),
          statusText: response.statusText(),
        };

        // Capture response body if enabled and it's JSON
        if (this.captureBody) {
          const contentType = response.headers()['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            try {
              entry.body = await response.json();
            } catch (e) {
              entry.bodyError = 'Failed to parse JSON';
              entry.bodyText = await response.text().catch(() => null);
            }
          }
        }

        this.responses.push(entry);

        // Prevent memory leaks
        if (this.responses.length > this.maxResponses) {
          this.responses.shift();
        }

        // Log errors
        if (status >= 400) {
          console.warn(`⚠️  API Error: ${method} ${this.simplifyURL(url)} → ${status}`);
        }

      } catch (error) {
        this.errors.push({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        console.error('APIResponseTracker error:', error);
      }
    });

    // Track request failures
    this.page.on('requestfailed', (request) => {
      const url = request.url();

       const failure = request.failure()?.errorText || '';
        // Ignore expected SPA aborts
  if (failure.includes('ERR_ABORTED')) return;

  // Ignore non-API assets
  if (request.resourceType() === 'image') return;
      
      if (url.includes('fakestoreapi.com')) {
        this.errors.push({
          url,
          method: request.method(),
          failure: request.failure()?.errorText || 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        
        console.error(`❌ Request Failed: ${request.method()} ${url}`);
        console.error(`   Error: ${request.failure()?.errorText}`);
      }
    });
  }

  hasCall(urlPattern, method = null) {
    return this.responses.some(resp => {
      const urlMatch = resp.url.includes(urlPattern);
      const methodMatch = method ? resp.method === method : true;
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

  /**
   * Get response body for a specific API call
   */
  getResponseBody(urlPattern, method = null) {
    const response = this.responses.find(resp => {
      const urlMatch = resp.url.includes(urlPattern);
      const methodMatch = method ? resp.method === method : true;
      return urlMatch && methodMatch;
    });
    
    return response?.body || null;
  }

  /**
   * Validate that API was called with expected status
   */
  assertCalled(urlPattern, method, expectedStatus = 200) {
    const response = this.responses.find(resp => {
      return resp.url.includes(urlPattern) && resp.method === method;
    });
    
    if (!response) {
      throw new Error(`API not called: ${method} ${urlPattern}`);
    }
    
    if (response.status !== expectedStatus) {
      throw new Error(
        `Unexpected status: ${method} ${urlPattern} → ${response.status} (expected ${expectedStatus})`
      );
    }
    
    return response;
  }

  getErrors() {
    return this.errors;
  }
  assertNoErrors() {
    const errorResponses = this.responses.filter(r => r.status >= 400);
    
    if (errorResponses.length > 0) {
      console.error('❌ Error responses detected:');
      errorResponses.forEach(r => {
        console.error(`   ${r.method} ${r.url} → ${r.status}`);
      });
      throw new Error(`${errorResponses.length} API error(s) detected`);
    }
    
    if (this.errors.length > 0) {
      console.error('❌ Request failures detected:');
      this.errors.forEach(e => {
        console.error(`   ${e.method} ${e.url}: ${e.failure}`);
      });
      throw new Error(`${this.errors.length} request failure(s) detected`);
    }
  }

  printSummary(title = 'API Call Summary') {
    console.log(`\n  📊 ${title}:`);
    
    const grouped = {};
    this.responses.forEach(resp => {
      const key = `${resp.method} ${this.simplifyURL(resp.url)} → ${resp.status}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    Object.entries(grouped).forEach(([key, count]) => {
      const hasError = key.includes(' → 4') || key.includes(' → 5');
      const icon = hasError ? '❌' : (count > 1 ? '🔄' : '✅');
      const countStr = count > 1 ? ` (×${count})` : '  (×1) ';
      console.log(`     ${icon} ${key}${countStr}`);
    });

    if (this.errors.length > 0) {
      console.log(`\n  ⚠️  Request Failures: ${this.errors.length}`);
    }
  }

  simplifyURL(url) {
    return url
      .replace('https://fakestoreapi.com', '')
      .replace(/\/\d+$/, '/:id')
      .replace(/\/user\/\d+$/, '/user/:userId');
  }

  reset() {
    this.responses = [];
    this.errors = [];
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
  const demoAccountButton = page.getByTestId('demo-accounts').locator('button').first();
  await demoAccountButton.click();
  await expect(page.getByTestId('username-input')).toHaveValue(TEST_CONFIG.username);
await expect(page.getByTestId('password-input')).toHaveValue(/.+/);
  
  console.log('     → Submitting credentials...');
  const loginbutton= page.getByTestId('login-button');
  await loginbutton.click();
  
  // Wait for API responses
  const [loginResponse, usersResponse] = await Promise.all([
    loginPromise,
    usersPromise,
  ]);
  
  // Wait for redirect
  await page.waitForURL('/');
  
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

async function addProductToCart(page) {
  await page.goto('/');
  
  const product = page.getByTestId('product-card')
    .filter({ has: page.locator('button:has-text("Add to Cart")') })
    .first();
  
  await product.scrollIntoViewIfNeeded();
  const productName = await product.locator('h3').textContent();
  
  console.log(`   → Adding to cart: "${productName.substring(0, 40)}..."`);
  

  const addButton=product.locator('button:has-text("Add to Cart")');
  await addButton.click();
//  await expect(addButton).toHaveText('Added to Cart', { timeout: 3000 });
  return productName;
}

base('Should perform ADD to Cart API call', async ({ page }) => {
   
    console.log('  🎯 TEST: Login Flow API Validation                         ');
   
    
    const tracker = new APIResponseTracker(page);;
    
    console.log('  📍 Action: User login\n');
    
   await performLogin(page);
   await addProductToCart(page);

   await page.waitForTimeout(1000);
    
   tracker.printSummary('Test 2 API Calls');
  });

  
