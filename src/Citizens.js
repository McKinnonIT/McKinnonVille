/**
 * Class representing a citizen with the capability to automatically fetch or create their profile.
 */
const MAX_OCCUPATION_LEVEL = 6;

class Citizen {
    /**
     * Constructs a Citizen instance, fetching their stats or creating a new profile if not found.
     * @param {string} email The citizen's email address, serving as a unique identifier.
     * @param {boolean} createIfNotExist Determines if a new citizen profile should be created if it doesn't exist.
     * @param {Object} stats Optional. Additional properties for a newly created citizen.
     */
    constructor(email, createIfNotExist = false, stats = {}) {
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
                        occupation: "Teacher",
                        occupationLevel: 1,
                        userId: "default/userId",
                        spaceId: "default/spaceId",
                        ...stats // Merge stats if provided
                    });
                    Logger.log("Citizen not found, creating a new citizen.")
                    createNewCitizen(this); // Create the new citizen
                }
            }
        } catch (error) {
            console.log(error.stack)
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

    /**
        * Increments the citizen's occupation level by 1 and updates the Citizens spreadsheet.
        * Ensures the occupation level does not exceed the maximum level.
        */
    levelUp() {
        if (this.occupationLevel < MAX_OCCUPATION_LEVEL) {
            this.occupationLevel = parseInt(this.occupationLevel) + 1;
            updateCitizenOccupationLevel(this.email, this.occupationLevel);

            // Get the plot image URL based on the citizen's gold
            const plotImageUrl = getImageUrlForSalary(this.gold);

            // Update the plot with the new image URL
            const plotCellReference = this.plot;
            allocatePlot(plotCellReference, plotImageUrl);

            // Send a congratulatory message
            let message;
            if (this.occupationLevel === MAX_OCCUPATION_LEVEL) {
                message = `🎉 Congratulations! You have reached the maximum level ${this.occupationLevel} in your occupation as a ${this.occupation}.`;
            } else {
                message = `Congratulations! You have leveled up to level ${this.occupationLevel} in your occupation as a ${this.occupation}.`;
            }
            sendMessage(message, this.spaceId);
        } else {
            // Send a message indicating the citizen has reached the maximum level
            const message = `You have already reached the maximum occupation level of ${MAX_OCCUPATION_LEVEL}.`;
            sendMessage(message, this.spaceId);
            Logger.log(`Citizen ${this.email} has reached the maximum occupation level of ${MAX_OCCUPATION_LEVEL}.`);
        }
    }
    /**
     * Updates the quiz attempts for the citizen.
     * @param {string} week - The week identifier for the quiz attempts.
     * @param {number} attempts - The number of attempts to set.
     */
    incrementQuizAttempts() {
        this.week = getWeek()
        incrementQuizAttempts(this.email, this.week);
    }
    /**
     * Gets the citizens current week quiz attempts
     */
    getQuizAttempts(week) {
        this.week = week;
        return getQuizAttempts(this.email, this.week);
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
        occupation: citizen[6],
        occupationLevel: citizen[7],
        gold: citizen[8],
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
    const { name, email, plot, userId, spaceId, house, gold, occupationLevel, occupation } = citizen;
    addNewCitizenRow(name, email, plot, userId, spaceId, house, gold, occupationLevel, occupation);
}


/**
 * Fetches statistics for a citizen based on their email from the Citizens Google Sheet.
 * @param {string} email The email address of the citizen whose stats are being fetched.
 * @returns {Object|null} An object containing the citizen's statistics if found, otherwise null.
 */
function getCitizenStats(email) {
    const sheetName = 'Citizens';
    const range = 'A2:W';
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
        return null;
    }

    const citizenIndex = values.findIndex(row => row[1] === email);
    if (citizenIndex === -1) {
        return null;
    }
    return mapCitizenData(values[citizenIndex]);
}


/**
 * Retrieves a list of citizens and their information from the Citizens Google Sheet.
 * @returns {Array<Object>} An array of objects, each containing the information of a citizen.
 */
function getAllCitizens() {
    const sheetName = 'Citizens'; // The name of your sheet
    const range = 'A2:G'; // Adjust if you need a different column or specific rows
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(sheetName + '!' + range)}`;
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
        // Map the array of arrays to an array of objects, assuming columns A:G correspond to the citizen's information
        const citizens = values.map(row => ({
            name: row[0],
            email: row[1],
            plot: row[2],
            userId: row[3],
            spaceId: row[4],
            house: row[5],
            occupation: row[6],
            occupationLevel: row[7],
            gold: row[8],
        }));
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
