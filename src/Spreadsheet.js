/**
 * Adds a new row to the 'Citizens' sheet in Google Sheets for a new citizen. This function appends a row
 * with detailed information about the citizen, including initializing their occupation levels.
 *
 * @param {string} name - The name of the citizen.
 * @param {string} email - The email of the citizen.
 * @param {string} plot - The plot assigned to the citizen.
 * @param {string} userId - The user ID in the Google Chat space.
 * @param {string} spaceId - The space ID of the Google Chat.
 * @param {string} house - The house to which the citizen belongs.
 * @param {number} currentGold - The initial amount of gold the citizen has.
 * @param {number} currentOccupationLevel - The initial level of the citizen's plot.
 * @param {string} currentOccupation - The occupation of the citizen.
 * @returns {object} The response from the Google Sheets API after appending the row.
 */
function addNewCitizenRow(name, email, plot, userId, spaceId, house, currentGold, currentOccupationLevel, currentOccupation) {
    const sheetName = 'Citizens';
    // Adjust the range to include all columns from A to W
    const range = `${sheetName}!A:W`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    // Define the occupation levels range constant
    const OCCUPATION_LEVELS_RANGE = "K2:W2";

    // The formula for currentOccupationLevel
    const annualSalaryFormula = `=VLOOKUP(INDIRECT("G" & ROW()), INDIRECT("Occupations!B:O"), IF(INDIRECT("H" & ROW())=1, 10, IF(INDIRECT("H" & ROW())=2, 11, IF(INDIRECT("H" & ROW())=3, 12, IF(INDIRECT("H" & ROW())=4, 13, IF(INDIRECT("H" & ROW())=5, 14, 1))))), FALSE)`
    const villageTaxRateFormula = `=VLOOKUP(INDIRECT("F" & ROW()), INDIRECT("Villages!A:O"), 15, FALSE)`
    const salaryPostTaxFormula = `=INDIRECT("I" & ROW()) - (INDIRECT("I" & ROW()) * INDIRECT("J" & ROW()))`
    const educationContributionFormula = `=VLOOKUP(INDIRECT("G" & ROW()), INDIRECT("Occupations!B:G"), 4, FALSE) * INDIRECT("H" & ROW())`
    const healthContributionFormula = `=VLOOKUP(INDIRECT("G" & ROW()), INDIRECT("Occupations!B:G"), 5, FALSE) * INDIRECT("H" & ROW())`
    const happinessContributionFormula = `=VLOOKUP(INDIRECT("G" & ROW()), INDIRECT("Occupations!B:G"), 6, FALSE) * INDIRECT("H" & ROW())`

    // Combine the provided values with the additional ones for columns K to W,
    const payload = JSON.stringify({
        values: [
            [
                // Name
                name,
                // Email
                email,
                // Plot
                plot,
                // User ID
                userId,
                // Space ID
                spaceId,
                // House / Village
                house,
                // Occupation
                currentOccupation,
                // Occupation Level
                1,
                // Annual Salary (Gold pretax)
                annualSalaryFormula,
                // Village Tax Rate
                villageTaxRateFormula,
                // Salary (Post Tax)
                salaryPostTaxFormula,
                // Education Contribution
                educationContributionFormula,
                // Health Contribution
                healthContributionFormula,
                // Happiness Contribtion
                happinessContributionFormula
            ]
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

/**
 * Fetches the house associated with a given email from the 'Houses' sheet in Google Sheets. 
 * It maps emails to house names and returns the house name if found. Throws an error if no house is associated with the email.
 *
 * @param {string} email - The email of the user for whom the house needs to be fetched.
 * @returns {string} The name of the house associated with the provided email.
 * @throws {Error} If no house is found for the provided email, an error is thrown.
 */
function getUserHouse(email) {
    const housesSheetName = 'Houses';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${housesSheetName}!A:B`;
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
    const data = JSON.parse(response.getContentText());
    const housesData = data.values;

    // Create a map from housesData, converting keys to lowercase
    const houseMap = new Map();
    housesData.forEach(function (row) {
        // Convert the email to lowercase before setting in the map
        const emailLowerCase = row[0].toLowerCase();
        houseMap.set(emailLowerCase, row[1]); // Assuming STKEY is in the first column and HOUSE in the second
    });

    // Convert the provided email to lowercase for comparison
    const emailLowerCase = email.toLowerCase();
    const username = emailLowerCase.substring(0, emailLowerCase.indexOf('@'));

    // Get the house based on the username
    house = houseMap.get(username);

    if (!house) {
        throw new HouseNotFound(`No house found for email: ${email}`);
    }
    return house
}

function updateCitizenOccupationLevel(email, newLevel) {
    const sheetName = 'Citizens';
    const range = 'A2:H'; // Adjust the range to include the occupation level column
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(sheetName + '!' + range)}`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    const options = { method: 'get', headers: headers, muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    const values = JSON.parse(response.getContentText()).values || [];

    if (values.length === 0) {
        Logger.log('No data found.');
        return;
    }

    const citizenIndex = values.findIndex(row => row[1] === email);
    if (citizenIndex === -1) {
        Logger.log('Citizen not found.');
        return;
    }

    const rowIndex = citizenIndex + 2; // Adjust for header row and 0-based index
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${sheetName}!H${rowIndex}?valueInputOption=USER_ENTERED`;
    const updateOptions = {
        method: 'put',
        headers: headers,
        muteHttpExceptions: true,
        payload: JSON.stringify({
            range: `${sheetName}!H${rowIndex}`,
            majorDimension: 'ROWS',
            values: [[newLevel]]
        })
    };

    UrlFetchApp.fetch(updateUrl, updateOptions);
}
