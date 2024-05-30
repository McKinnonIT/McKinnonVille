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
 * @param {number} currentPlotLevel - The initial level of the citizen's plot.
 * @param {string} currentOccupation - The occupation of the citizen.
 * @returns {object} The response from the Google Sheets API after appending the row.
 */
function addNewCitizenRow(name, email, plot, userId, spaceId, house, currentGold, currentPlotLevel, currentOccupation) {
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
    // const currentOccupationLevelFormula = `=INDEX(INDIRECT("K"&ROW()&":W"&ROW()), MATCH(INDIRECT("J"&ROW()), INDIRECT("${OCCUPATION_LEVELS_RANGE}"), 0))`;
    const villageTaxRateFormula = `=VLOOKUP(G15,'Occupation Stats'!B:O,if(H15=1,10,if(H15=2,11,IF(H15=3,12,IF(H15=4,13,IF(H15=5,14,1))))),false)`
    const educationContributionFormula = `=VLOOKUP(G15,'Occupation Stats'!B:G,4,FALSE)*H15`
    const healthContributionFormula = `=VLOOKUP(G15,'Occupation Stats'!B:G,5,FALSE)*H15`
    const happinessContributionFormula = `=VLOOKUP(G15,'Occupation Stats'!B:G,6,FALSE)*H15`

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
                "0000",
                // Village Tax Rate
                villageTaxRateFormula,
                // Salary (Post Tax)
                "0000",
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
