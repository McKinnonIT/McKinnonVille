function addNewCitizenRow(name, email, plot, userId, spaceId, houseGroup, currentGold, currentPlotLevel, currentOccupationLevel, currentOccupation) {
    var sheetName = 'Citizens';
    // Adjust the range to include all columns from A to W
    var range = `${sheetName}!A:W`;
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;
    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    // Create an array filled with the number 1 for columns K to W
    // There are 15 columns from K to W (inclusive), so we create an array of 15 ones.
    const initialOccupationLevels = new Array(13).fill(1);

    // Combine the provided values with the additional ones for columns K to W
    var payload = JSON.stringify({
        values: [
            [name, email, plot, userId, spaceId, houseGroup, currentGold, currentPlotLevel, currentOccupationLevel, currentOccupation, ...initialOccupationLevels],
        ],
    });

    var options = {
        method: 'post',
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    return UrlFetchApp.fetch(url, options);
}
