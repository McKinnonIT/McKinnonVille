
function getAvailablePlots() {
    // Assuming you want to check the entire sheet, you might need to adjust this to a more specific range for efficiency
    var range = "Map"; // Adjust the range as needed
    var spreadsheetId = SPREADSHEET_ID; // Replace with your actual spreadsheet ID
    var targetFormula = '=IMAGE("https://github.com/McKinnonIT/McKinnonVille/blob/main/Grass%201.png?raw=true",2)';
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=FORMULA`;

    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(), // Ensure this function gets a valid OAuth token
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
        for (var i = 0; i < values.length; i++) {
            for (var j = 0; j < values[i].length; j++) {
                if (values[i][j] === targetFormula) {
                    // Assuming the leftmost column is 'A', construct the cell reference
                    var cellRef = columnToLetter(j + 1) + (i + 1); // Converts column index to letter and row to 1-based index
                    availablePlots.push(cellRef);
                }
            }
        }
    }

    return availablePlots; // Returns an array of cell references for cells containing the target formula
}

function simulateAllocateAllPlots() {
    var availablePlots = getAvailablePlots();

    for (var i = 0; i < availablePlots.length; i++) {
        Logger.log(`Allocating ${i}`)
        allocatePlot(availablePlots[i])
    }
}

function allocatePlot(cellReference) {
    var sheetName = 'Map';
    var range = `${sheetName}!${cellReference}`; // Cell reference to allocate
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    var payload = JSON.stringify({
        values: [
            ['=IMAGE("https://github.com/McKinnonIT/McKinnonVille/blob/main/Tent.png?raw=true")'], // Set the cell to this formula
        ],
    });
    var options = {
        method: 'put', // Use PUT to update
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    var response = UrlFetchApp.fetch(url, options);
}


function getCitizens() {
    const sheetName = 'Citizens'; // The name of your sheet
    const range = 'B3:B'; // Adjust if you need a different column or specific rows
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName + '!' + range)}`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(), // Assumes getServiceAccountToken() is defined and returns a valid token
        'Content-Type': 'application/json',
    };
    const options = {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const values = JSON.parse(response.getContentText()).values;

    if (values && values.length > 0) {
        // Flatten the array of arrays to a single-level array, assuming each sub-array has only one element (the value from column B)
        const citizens = values.map(row => row[0]);
        Logger.log(citizens);
        return citizens;
    } else {
        Logger.log('No data found.');
        return [];
    }
}
