/**
 * Class representing a citizen with the capability to automatically fetch or create their profile.
 */
class Citizen {
    /**
     * Constructs a Citizen instance, fetching their stats or creating a new profile if not found.
     * @param {string} email The citizen's email address, serving as a unique identifier.
     * @param {Object} stats Optional. Additional properties for a newly created citizen.
     * @param {boolean} createIfNotExist Determines if a new citizen profile should be created if it doesn't exist.
     */
    constructor(email, stats = {}, createIfNotExist = false) {
        try {
            const citizenStats = getCitizenStats(email);
            if (citizenStats) {
                this.initializeProperties(citizenStats);
            } else {
                // If getCitizenStats does not throw but returns a falsy value, and creation is allowed
                if (createIfNotExist) {
                    this.email = email;
                    this.initializeProperties({
                        name: "Default Name",
                        plot: "Default Plot",
                        house: "Default House",
                        gold: 0,
                        plotLevel: 1,
                        occupation: "Teacher",
                        userId: "default/userId",
                        spaceId: "default/spaceI",
                        ...stats // Merge stats if provided
                    });
                    Logger.log("Citizen not found, creating a new citizen.")
                    createNewCitizen(this); // Create the new citizen
                } else {
                    throw new Error('Citizen not found and creation is not allowed.');
                }
            }
        } catch (error) {
            Logger.log(error.message);
            // Handle cases where the citizen is not found and creation is not allowed
            // This could involve setting the object to a default state, logging an error, etc.
        }
    }

    /**
     * A utility method to initialize citizen's properties from provided data.
     * @param {Object} properties The properties to be assigned to the citizen.
     */
    initializeProperties(properties) {
        Object.keys(properties).forEach(key => {
            this[key] = properties[key];
        });
    }

    exists() {
        return Object.keys(this).length > 0;
    }
}

/**
 * Maps raw data from the Citizens Google Sheet into a structured object representing a citizen's statistics.
 * @param {Array} citizen An array of values corresponding to a citizen's data.
 * @returns {Object} An object containing mapped properties of the citizen.
 */
function mapCitizenData(citizen) {
    return {
        name: citizen[0],
        email: citizen[1],
        plot: citizen[2],
        userId: citizen[3],
        spaceId: citizen[4],
        house: citizen[5],
        gold: citizen[6],
        plotLevel: citizen[7],
        occupationLevel: citizen[8],
        occupation: citizen[9],
    };
}

/**
 * Creates a new citizen entry in the datastore and appends it to the "Citizens" Google Sheet.
 * This function constructs a row array from the citizen object properties and calls
 * the addNewCitizenRow function to handle the actual insertion into the sheet.
 *
 * @param {Object} citizen An object representing a citizen, containing all necessary properties
 *                         such as name, email, plot, house, gold, plot level, occupation level,
 *                         and occupation. The function also expects userId and spaceId to be
 *                         either included in the citizen object or to be available globally.
 */
function createNewCitizen(citizen) {
    // Extracting properties from the citizen object
    const { name, email, plot, userId, spaceId, house, gold, plotLevel, occupation } = citizen;
    addNewCitizenRow(name, email, plot, userId, spaceId, house, gold, plotLevel, occupation);
}


/**
 * Fetches statistics for a citizen based on their email from the Citizens Google Sheet.
 * @param {string} email The email address of the citizen whose stats are being fetched.
 * @returns {Object|null} An object containing the citizen's statistics if found, otherwise null.
 */
function getCitizenStats(email) {
    const sheetName = 'Citizens';
    const range = 'A3:V';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName + '!' + range)}`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    const options = { method: 'get', headers: headers, muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    const values = JSON.parse(response.getContentText()).values || [];

    if (values.length === 0) {
        Logger.log('No data found.');
        return null;
    }

    const citizenIndex = values.findIndex(row => row[1] === email);
    if (citizenIndex === -1) {
        return null;
    }
    return mapCitizenData(values[citizenIndex]);
}


/**
 * Retrieves a list of citizens from the Citizens Google Sheet.
 * @returns {Array<string>} An array containing the names of all citizens found in the Citizens Google Sheet.
 */
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
        return citizens;
    } else {
        Logger.log('No data found.');
        return [];
    }
}

/**
 * Generates a structured message object for displaying a citizen's statistics in a Google Chat Card.
 * @param {string} name The citizen's name.
 * @param {string} house The citizen's house.
 * @param {string} plot The citizen's plot.
 * @param {string} occupation The citizen's occupation.
 * @param {number} occupationLevel The level of the citizen's occupation.
 * @param {number} gold The amount of gold the citizen has.
 * @returns {Object} A message object suitable for display in Google Chat.
 */
function sendCitizenStatsMessage(name, house, plot, occupation, occupationLevel, gold) {
    return {
        "action_response": {
            "type": "NEW_MESSAGE"
        },
        "cardsV2": [
            {
                "cardId": "reply-card-id",
                "card": {
                    "header": {
                        "subtitle": "Your McKinnonVille",
                        "title": `${name}`,
                        "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Modern%20House.png",
                        "imageType": "CIRCLE"
                    },
                    "sections": [
                        {
                            "header": "",
                            "collapsible": false,
                            "uncollapsibleWidgetsCount": 1,
                            "widgets": [
                                {
                                    "decoratedText": {
                                        "icon": {
                                            "iconUrl": "https://cdn-icons-png.flaticon.com/512/11562/11562337.png"
                                        },
                                        "topLabel": "House",
                                        "text": `${house}`
                                    }
                                },
                                {
                                    "decoratedText": {
                                        "icon": {
                                            "iconUrl": "https://cdn-icons-png.flaticon.com/512/1054/1054092.png"
                                        },
                                        "topLabel": "Plot",
                                        "text": `${plot}`
                                    }
                                },
                                {
                                    "decoratedText": {
                                        "icon": {
                                            "iconUrl": "https://cdn-icons-png.flaticon.com/512/3952/3952988.png"
                                        },
                                        "topLabel": "Occupation",
                                        "text": `${occupation}`,
                                        "bottomLabel": `Level ${occupationLevel}`
                                    }
                                },
                                {
                                    "decoratedText": {
                                        "icon": {
                                            "iconUrl": "https://cdn-icons-png.flaticon.com/128/566/566445.png"
                                        },
                                        "topLabel": "Gold",
                                        "text": `${gold}`
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
}

