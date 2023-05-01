# shopify-google-sheet
sync shopify data to google sheet

# Core concept
1. using internal graphql app shopify to get product data and put in in data directory (this step is manual, will enhance in future)
2. running app.js by using node js then it will process all file in data directory and merge it to an array
3. connecting google sheet by using your own keys credential and provide the sheet that u want to update
4. the google sheet will update the product quantity by mapping with the variant ID 
