function addNewCitizenRow(name, email, plot, userId, spaceId, houseGroup, currentGold, currentPlotLevel, currentOccupation) {
    const sheetName = 'Citizens';
    // Adjust the range to include all columns from A to W
    const range = `${sheetName}!A:W`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    // Define the occupation levels range constant
    const OCCUPATION_LEVELS_RANGE = "K2:W2";

    // The formula for currentOccupationLevel
    const currentOccupationLevelFormula = `=INDEX(INDIRECT("K"&ROW()&":W"&ROW()), MATCH(INDIRECT("J"&ROW()), INDIRECT("${OCCUPATION_LEVELS_RANGE}"), 0))`;

    // Create an array filled with the number 1 for columns K to W
    // There are 13 columns from K to W (inclusive), so we create an array of 13 ones.
    const initialOccupationLevels = new Array(13).fill(1);

    // Combine the provided values with the additional ones for columns K to W,
    const payload = JSON.stringify({
        values: [
            [name, email, plot, userId, spaceId, houseGroup, currentGold, currentPlotLevel, currentOccupationLevelFormula, currentOccupation, ...initialOccupationLevels],
        ],
    });

    const options = {
        method: 'post',
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    return UrlFetchApp.fetch(url, options);
}
