import { test as base, expect } from '@playwright/test';

const TEST_CONFIG = {
  username: process.env.TEST_USERNAME || 'johnd',
  password: process.env.TEST_PASSWORD || 'm38rmF$',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  apiTimeout: 30000,
  waitTimeout: 3000,
};

console.log(' FINAL COMPREHENSIVE E2E API VALIDATION TEST SUITE ');
console.log('  • Username:', TEST_CONFIG.username);

// API Response Tracker - Monitors all API calls & Responses during tests
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

      const urlMatch = 
       urlPattern instanceof RegExp
        ? urlPattern.test(resp.url)
        : resp.url.includes(urlPattern);
      
      // resp.url.includes(urlPattern);
      const methodMatch = method ? resp.method === method : true;
      return urlMatch && methodMatch;
    });
  }

  getCallCount(urlPattern, method = null) {
    return this.responses.filter(resp => {
        const urlMatch = 
       urlPattern instanceof RegExp
        ? urlPattern.test(resp.url)
        : resp.url.includes(urlPattern);
      const methodMatch = method ? resp.method === method : true;
      return urlMatch && methodMatch;
    }).length;
  }

  /**
   * Get response body for a specific API call
   */
  getResponseBody(urlPattern, method = null) {
    const response = this.responses.find(resp => {
        const urlMatch = 
       urlPattern instanceof RegExp
        ? urlPattern.test(resp.url)
        : resp.url.includes(urlPattern);
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

async function performLogin(page) {
  await page.goto('/login');
  const demoAccountButton = page.getByTestId('demo-accounts').locator('button').first();
  await demoAccountButton.click();
 const loginbutton= page.getByTestId('login-button');
  await loginbutton.click();
  await page.waitForURL('/');
}


base('Performing login flow ', async ({ page }) => {
   const tracker = new APIResponseTracker(page);
  
  // 1. Perform user action
  await performLogin(page);

  // Wait until login API is actually called 
  //used to get data from the api called in our page so we can check the actual api is called or not and can test the status too.it conly check if the api is called or not but doesnt shows if match with correct status code but it 
await expect.poll(() =>
  tracker.hasCall(/\/auth\/login$/, 'POST')
).toBe(true);

// Extract response body but it is redundant as we have assertCalled funtoon to check status and response
// const loginResponse = tracker.getResponseBody(/\/auth\/login$/, 'POST');

const loginResponse=tracker.assertCalled('/auth/login', 'POST', 201);

expect(loginResponse.body).toBeTruthy();
expect(loginResponse.body.token).toBeTruthy();

// Save token if needed
const token = loginResponse.body.token;
console.log('🔐 Login token:', token);

  
  // 2. Verify UI result
  await expect(page.getByText('John')).toBeVisible();
   await page.waitForTimeout(2000);
  // 3. Verify side effects (APIs, storage)
 

  //this is to verifu if thr following api is called once or not but doesnt check the actual status  and even if they are called but dshows wrong status like 400,500 they will pass beacuse it only check if it is called or not not actual data and responses.so it is valid to use here because we focus on login here not actaul all data for it we check in other test files 
 expect(tracker.hasCall('/users', 'GET')).toBe(true);
expect(tracker.hasCall(/\/carts\/user\/\d+$/, 'GET')).toBe(true);
expect(tracker.hasCall(/\/products\/\d+$/, 'GET')).toBe(true);

  expect(tracker.hasCall('/products/categories', 'GET')).toBe(true);
  expect(tracker.hasCall('/products', 'GET')).toBe(true);
  
const storedToken = await page.evaluate(() =>
  localStorage.getItem('swmart_token')
);

expect(storedToken).toBe(token);
  // 4. Check for errors
  tracker.assertNoErrors();
  tracker.printSummary();
  });

  
