const puppeteer = require('puppeteer');
require('dotenv').config()

const SHOP_NAME = process.env.SHOP_NAME;

console.log(`https://${SHOP_NAME}.myshopify.com/admin/apps/graphql`);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navigate to the GraphiQL app login page
  await page.goto(`https://${SHOP_NAME}.myshopify.com/admin/apps/graphql`, { waitUntil: 'networkidle0' });

  // Fill in the email and password fields
  await page.type('#account_email', 'YOUR_EMAIL');
  await page.type('#account_password', 'YOUR_PASSWORD');

  // Click the "Log in" button
  await page.click('#login_form button[type="submit"]');

  // Wait for the user dashboard page to load
  await page.waitForSelector('.header-merchant-info');

  // Make a GraphQL query using the Shopify GraphiQL app
  const query = `{
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }`;

  // Navigate to the GraphiQL app and paste in the query
  await page.goto(`https://${SHOP_NAME}.myshopify.com/admin/apps/graphql`, { waitUntil: 'networkidle0' });
  await page.click('#graphiql-explorer-root .execute-button');
  await page.click('#graphiql-explorer-root .CodeMirror');
  await page.keyboard.type(query);

  // Click the "Run" button and wait for the results to load
  await page.click('#graphiql-explorer-root .execute-button');
  await page.waitForSelector('.result-window');

  // Get the query results as JSON
  const result = await page.evaluate(() => {
    return JSON.parse(document.querySelector('.result-window').innerText);
  });

  console.log(result);

  await browser.close();
})();
