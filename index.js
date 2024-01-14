import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch(
  {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.56 Safari/537.36']
  }
);
const page = await browser.newPage();



const login = async (url) => {
  await page.goto(url);
  const cookies = await page.cookies();
  fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2), function (error) {
    if (error) console.log('Error has occured');
  });
}

const download = async (url) => {
  var cookiesString = fs.readFileSync('cookies.json');
  var cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  await page.goto('https://elements.envato.com/admin-template-adminto-E85H4R');
  await page.waitForSelector('button[data-testid="action-bar-download-button"]');
  await page.click('button[data-testid="action-bar-download-button"]');

  await page.setRequestInterception(true);
  page.on('request', request => {
    var url = request.url();
    if (url.indexOf('download') > -1) {
      if (url.includes('download_and_license') || url.includes('facebook')) {
      } else {
        console.log('Download URL: ' + url);
        
        // request.abort();
      }
    }
    // request.continue();
  });


  const client = await page.target().createCDPSession();
  await client.send('Network.setRequestInterception', {
    patterns: [{
      urlPattern: '*',
      resourceType: 'Document',
      interceptionStage: 'HeadersReceived'
    }],
  });

  await client.on('Network.requestIntercepted', async e => {
    let headers = e.responseHeaders || {};
    let contentType = headers['content-type'] || headers['Content-Type'] || '';
    let obj = { interceptionId: e.interceptionId };
    if (contentType.indexOf('application/zip') > -1) {
      obj['errorReason'] = 'BlockedByClient';
    }

    await client.send('Network.continueInterceptedRequest', obj);
  });

  await page.waitForSelector('button[data-testid="download-without-license"]');
  await page.click('button[data-testid="download-without-license"]');
}


