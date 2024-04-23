/**
 * Simulates the allocation of all available plots for a specified house. This function is async
 * because it waits for multiple plot allocations to complete concurrently.
 */
async function simulateAllocateAllPlots() {
    var house = 'gilmore'; // Provide the house name
    var availablePlots = getAvailablePlots(house);

    // Map availablePlots to an array of Promises for concurrent processing
    var allocationPromises = availablePlots.map(plot => allocatePlot(plot));

    // Wait for all allocation Promises to resolve
    await Promise.all(allocationPromises);

    Logger.log(`All plots allocated for ${house}`);
}

/**
 * Fetches available plots for a given house from a Google Sheet. It compares each cell's formula
 * against a target formula to determine if the plot is available.
 * 
 * @param {string} house - The name of the house to check for available plots.
 * @returns {Array} An array of cell references (e.g., "A1", "B2") for available plots.
 */
function getAvailablePlots(house) {
    // Convert the house parameter to lowercase for case-insensitive comparison
    var houseLowerCase = house.toLowerCase();
    var range = "Map"; // Define the range dynamically based on application needs
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_MAP}/values/${range}?valueRenderOption=FORMULA`;
    var houseFormulas = {
        chisholm: '=IMAGE("https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Grass%201_chisholm.png")',
        monash: '=IMAGE("https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Grass%201_monash.png")',
        flynn: '=IMAGE("https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Grass%201_flynn.png")',
        gilmore: '=IMAGE("https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Grass%201_gilmore.png")'
    };

    // Ensure keys in houseFormulas are in lowercase for accurate matching
    var houseFormulasLowerCase = {};
    for (var key in houseFormulas) {
        houseFormulasLowerCase[key.toLowerCase()] = houseFormulas[key];
    }

    if (!(houseLowerCase in houseFormulasLowerCase)) {
        throw new Error('Invalid house provided');
    }

    var targetFormula = houseFormulasLowerCase[houseLowerCase];

    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    var options = {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true,
    };

    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    var values = jsonResponse.values;

    var availablePlots = [];

    if (values && values.length > 0) {
        // Iterate over each cell to find matches with the target formula
        for (var i = 0; i < values.length; i++) {
            for (var j = 0; j < values[i].length; j++) {
                if (values[i][j] === targetFormula) {
                    var cellRef = columnToLetter(j + 1) + (i + 1); // Converts column index to letter and row to 1-based index
                    availablePlots.push(cellRef);
                }
            }
        }
    }

    return availablePlots; // Return cell references for available plots
}

/**
 * Allocates a specific plot by updating its content with a new image formula.
 * This operation is performed as an asynchronous HTTP PUT request to the Google Sheets API.
 * 
 * @param {string} cellReference - The cell reference (e.g., "A1") of the plot to be allocated.
 * @returns {Promise} A Promise that resolves to the HTTP response of the operation.
 */
async function allocatePlot(cellReference) {
    var sheetName = 'Map';
    var range = `${sheetName}!${cellReference}`; // Specific cell to update
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_MAP}/values/${range}?valueInputOption=USER_ENTERED`;
    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    var payload = JSON.stringify({
        values: [
            ['=IMAGE("https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Tent.png")'] // Update cell with this formula
        ],
    });
    var options = {
        method: 'put',
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    var response = await UrlFetchApp.fetch(url, options); // Await the fetch operation
    return response;
}
