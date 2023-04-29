const fs = require('fs');
require('dotenv').config()
const { google } = require('googleapis');

let productList;
const spreadsheetId = process.env.SHEET_ID;
const sheetName = 'Sheet1';

try {
    combineData('./data').then((jsonData) => {
        productList = processData(jsonData);
        connectGoogleSheet();
    });
} catch (error) {
    console.log(error);
}

// update google sheets ----------------------------------------------------------------------------------
function connectGoogleSheet() {
    const keys = require(process.env.GOOGLE_APPLICATION_CREDENTIALS); // replace with your own credentials file
    // authorize the client with the credentials
    const client = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    client.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Connected to Google Sheets API!');
            openGoogleSheet(client);
        }
    });
}
function openGoogleSheet(client) {
    // get the sheet data
    const sheets = google.sheets({ version: 'v4', auth: client });
    sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName,
    }, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        const rows = res.data.values;
        updateGoogleSheet(rows, sheets);
    });
}
function updateGoogleSheet(rows, sheets) {
    // find and update the quantity for each product variant
    for (let i = 2; i < rows.length; i++) {
        const variantId = rows[i][0];
        const quantity = getProductVariantQuantity(variantId);
        console.log(`Updated quantity for ${variantId}: ${quantity}`);
        sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!L${i + 1}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[quantity]]
            }
        }, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Updated quantity for ${variantId}: ${quantity}`);
        });
    }
}
// ----------------------------------------------------------------------------------
// get the quantity for a product variant ID
function getProductVariantQuantity(variantId) {
    // replace with your own code to map the variant ID to the quantity
    const productItem = productList.find(product => product.legacyResourceId === variantId);
    return productItem ? productItem.inventoryQuantity : 0;
}
function processData(response) {
    return response.map(product => {
        const variants = product.node.variants.edges;

        return variants.map(variant => {
            const { legacyResourceId, inventoryQuantity } = variant.node;
            return { legacyResourceId, inventoryQuantity };
        });
    }).flat();
}
function combineData(directoryPath) {
    // Read each JSON file in the directory
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        fs.readdir(directoryPath, (err, files) => {
            let combinedData = [];
            if (err) throw err;
            // Loop through each file
            files.forEach((file) => {
                // Check if file is a JSON file
                if (file.endsWith('.json')) {
                    // Read file contents and parse JSON
                    const fileData = fs.readFileSync(`${directoryPath}/${file}`, 'utf-8');
                    const jsonData = JSON.parse(fileData);
                    // Add array from JSON to combined data array
                    combinedData = [...combinedData, ...jsonData];
                }
            });
            resolve(combinedData);
        });
    })
}