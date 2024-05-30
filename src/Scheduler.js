/**
 * Fetches the current week based on the starting dates provided in the "Setup" sheet.
 * The "Setup" sheet should have columns "Week" and "Date", where "Date" indicates the starting date of each week.
 * 
 * @returns {number} The current week number.
 */
function getCurrentWeek() {
    const sheetName = 'Setup';
    const range = encodeURIComponent(`${sheetName}!A2:B`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${range}`;

    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    const values = result.values;

    if (!values || values.length === 0) {
        Logger.log('No week date information found.');
        return null;
    }

    const currentDate = new Date();
    let currentWeek = null;

    for (let i = values.length - 1; i >= 0; i--) {
        const [week, dateStr] = values[i];
        const weekStartDate = new Date(dateStr.split('/').reverse().join('-')); // Convert to YYYY-MM-DD format

        if (currentDate >= weekStartDate) {
            currentWeek = parseInt(week);
            break;
        }
    }

    if (currentWeek === null) {
        Logger.log('The current date is before all provided week start dates.');
    }

    return currentWeek;
}

// Test the function
function testGetCurrentWeek() {
    const currentWeek = getCurrentWeek();
    Logger.log('Current Week: ' + currentWeek);
}
