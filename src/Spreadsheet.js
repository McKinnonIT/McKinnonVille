function appendRow(rowArray) {
    var sheetName = 'Citizens';
    var range = `${sheetName}!A:B`;
    var url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW`;
    var headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    var payload = JSON.stringify({
        values: [
            rowArray,
        ],
    });
    var options = {
        method: 'post',
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
}
