
import{test as base,expect} from '@playwright/test'
import { url } from 'node:inspector';
const TEST_CONFIG={
    username:process.env.TEST_USERNAME ||'johnd',
    password:process.env.TEST_PASSWORD ||'m37rmF4',
    baseURL: process.env.BASE_URL ||'http://localhost:3000',
    apiTimeout:30000,
    waitTimeout:3000,
};

class APIResponseTracker{
    constructor(page,options={}){
        this.page=page;
        this.responses=[];
        this.errors=[];
        this.maxResponses=options.maxResponses||1000;
        this.captureBody=options.captureBody||false;
        this.setupListener();

    }

    setupListener(){

        this.page.on('response',async(response)=>{
            try{
                const url=response.url();
                const request=response.request();
            if(
                !url.inclusdes('fakestoreapi.com') || !['xhr','fetch'].includes(request.resourseType())
            )            
        {
            return;
        }
            const status=response.status();
            const method=response.request().method();
            const entry={
                url,method,status,
                timestamp:new Date().toISOString(),
                headers:response.headers(),
                isOk:response.ok(),
                statusText:response.statusText(),
            };

            if(this.captureBody){
                const contentType=response.header()['content-type']||'';
                if(contentType.include('application/json')){
                    try{
                        entry.body=await response.json();
                    }catch(e){
                        entry.bodyError='failed to parse JSON';
                        entry.bodyText=await response.text().catch(()=>null);
                    }
                }
            }

            this.responses.push(entry);

            if(this.responses.length>this.maxResponses){
                this.responses.shift();
            }
            if(status>=400){
                console.warn(`api error:${method}${this.simplifyURL(url)} => ${status}`);
    }
        }catch(error){
            this.errors.push({
                error:error.message,
                timestamp:new.Date().toISOString(),
            });
            console.error('apiResponseYTracaker error:',error);
        }}  );


        this.page.on('requestfailed',(request)=>{
            const url=request.url();
            const failure=request.failure()?.errorText || "";

            if(failure.include('ERR_ABORTED')) return;
            if(request.resourceType()==='image')return;
            if(url.include('fakestoreapi.com')){
                this.errors.push({
                    url,
                    method:request.method(),
                    failure:request.failure()?.errorText ||'Unknown error',
                    timestamp:new Date().toISOString(),
                });
                
            }
        });
    }

    hasCall(urlPattern,method=null){
        return this.responses.some(resp=>{
            const urlMatch=
            urlPattern instanceof RegExp
            ?urlPattern.test(resp.url)
            :resp.url.includes(urlPattern);

            const methodMatch = method?resp.method === method : true;
            return urlMatch && methodMatch;
        });
    }

    getCallCount(urlPattern,method=null){
        return this.responses.filter(resp=>{
            const urlMatch = resp.url.includes(urlPattern);
            const methodMatch = method?resp.method ===method :true;
            return urlMatch && methodMatch;
        }).length;
    }
    getResponseBody(urlPattern,method=null){
        const response=this.responses.find(resp=>{
            const urlMatch =resp.url.includes(urlPattern);
            const methodMatch =method?resp.method===method:true;
            return urlMatch&& methodMatch;
        });
        return response?.body||null;
    }


    assertCalled(urlPattern,method,expectedStatus=200){
        const  response=this.responses.find(resp=>{
            return resp.url.includes(urlPattern)&& resp.method===method;
        });
        if(!response){
            throw new Error(`api not called:${method}${urlPattern}`);
        }
        if(response.status!==expectedStatus){
            throw new Error(  `Unexpected status: ${method} ${urlPattern} → ${response.status} (expected ${expectedStatus})`);
        }
        return response;
        }

        getError(){
            return this.errors;
        }

        assertNoError(){
            const errorResponses=this.responses.filter(r=>r.status>=400);
            if(errorResponses.length>0){
                console.log(`error responses detected`);
                errorResponses.forEach(r=>{
                    console.log(``)
                });
                throw new Error(`api error detected`);
            }

            if(this.errors.length>0){
                console.log(   `request failure detected`);
                this.errors.forEach(e=>{
                    console.log(`${e.method}`);
                });
                throw new Error(``);
            }
        }

        printSummary(title='api call summary'){
            console.log(`${title}:`);
            const grouped={};
            this.responses.forEach(resp=>{
                const key= `${resp.method} ${this.simplifyURL(resp.url) }  =>${resp.status}`;
                grouped[key]=(grouped[key]||0)+1;
            });
            object.entries(grouped).forEach(([key,count])=>{
                const hasError =key.includes('=>4')||key.includes('=>5');
                const icon =hasError?'X':(count >1 ?'multiple' :'single');
                const countStr=count >1?`(x${count})`:'(x1)';
                console.log(`${icon} ${key} ${countStr}`);
            });
            if(this.errors.length>0){
                console.log(`\n request failures:${this.errors.length};`)
            }
        }

simplifyURL(){
    return url
    .replace('https://fakestoreapi.com','')
    .replace(/\/\d+$/,'/:id')
    .replace(/\/user\/\d+$/,'/user/:userId');
}

reset(){
    this.responses=[];
    this.errors=[];
}
}

async function performLogin(page){
    await page.goto('/login');
    const demoAccountButton=page.getByTestId('demo-accounts').locator('button').first();
    await demoAccountButton.click();
    const loginButton =page.getByTestid('login-button');
    await loginButton.click();
    await page.waitForURL('/');
}

base('performing login flow ',async({page})=>{
    const tracker=new APIResponseTracker(page);

    await performLogin();
    await expect(page.getByText('john')).toBeVisible();
    await page.waitForTimeout(2000);

    //

    expect(tracker.hasCall('/users','GET')).toBe(true);
    tracker.getResponseBody();


})