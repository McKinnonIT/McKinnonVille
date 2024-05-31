/**
 * Creates a dictionary with dates as keys and week numbers as values.
 * The dates range from each week's start date to six days after.
 *
 * @param {Array} weekStartDates - An array of objects, each containing a week number and start date.
 * @returns {Object} A dictionary with dates as keys and week numbers as values.
 */
function createWeekDateDictionary(weekStartDates) {
    const weekDateDictionary = {};

    for (let i = 0; i < weekStartDates.length; i++) {
        const weekNumber = weekStartDates[i].week;
        const startDateStr = weekStartDates[i].date;

        if (!startDateStr) {
            Logger.log(`Invalid date string for week ${weekNumber}`);
            continue;
        }

        const startDate = new Date(startDateStr.split('/').reverse().join('-'));

        for (let j = 0; j < 7; j++) { // Include start date + next 6 days
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + j);

            const dateKey = [
                ('0' + currentDate.getDate()).slice(-2),
                ('0' + (currentDate.getMonth() + 1)).slice(-2),
                currentDate.getFullYear()
            ].join('/');

            weekDateDictionary[dateKey] = weekNumber;
        }
    }

    return weekDateDictionary;
}

/**
 * Fetches the start dates and week numbers from the "Setup" sheet.
 * The "Setup" sheet should have columns "Week" and "Date".
 * 
 * @returns {Array} An array of objects, each containing a week number and start date.
 */
function getWeekStartDates() {
    const sheetName = 'Setup';
    const range = encodeURIComponent(`${sheetName}!A2:B16`);
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
        return [];
    }

    return values.map(row => ({
        week: parseInt(row[0]),
        date: row[1]
    }));
}

/**
 * Helper function to get the week number for a given date string.
 * 
 * @param {string} dateStr - The date string in the format "DD/MM/YYYY".
 * @returns {number|string} The week number or an error message with the valid date range if the date is invalid.
 */
function getWeek(dateStr) {
    const weekStartDates = getWeekStartDates();
    const weekDateDictionary = createWeekDateDictionary(weekStartDates);

    if (!weekDateDictionary[dateStr]) {
        const validDateRange = weekStartDates.map(startDate => startDate.date).join(' to ');
        return `Error: Invalid date. The date ${dateStr} is outside the valid week start date limits. Valid date range: ${validDateRange}.`;
    }

    return weekDateDictionary[dateStr];
}
