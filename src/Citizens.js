class Citizen {
    constructor(email) {
        const citizenStats = getCitizenStats(email);
        if (citizenStats) {
            this.name = citizenStats.name;
            this.email = citizenStats.email;
            this.plot = citizenStats.plot;
            this.house = citizenStats.house;
            this.gold = citizenStats.gold;
            this.plotLevel = citizenStats.plotLevel;
            this.occupationLevel = citizenStats.occupationLevel;
            this.occupation = citizenStats.occupation;
        } else {
            throw new Error('Citizen not found.');
        }
    }
}

// Function to get citizen stats, adapted from your getCitizenStats example
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
        Logger.log('Citizen not found.');
        return null;
    }
    return mapCitizenData(values[citizenIndex]);
}

function mapCitizenData(citizen) {
    return {
        name: citizen[0],
        email: citizen[1],
        plot: citizen[2],
        house: citizen[5],
        gold: citizen[6],
        plotLevel: citizen[7],
        occupationLevel: citizen[8],
        occupation: citizen[9],
    };
}


/**
 * Retrieves the list of citizens from a Google Sheets spreadsheet.
 * 
 * @returns {string[]} An array of citizen names.
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
 * Generates a response object for Google Chat containing a card that displays a citizen's statistics.
 * 
 * The card includes information about the citizen's name, house, plot, occupation, occupation level, and gold.
 * Each piece of information is presented with an accompanying icon.
 * 
 * @param {string} name - The name of the citizen.
 * @param {string} house - The house of the citizen.
 * @param {string} plot - The plot of the citizen.
 * @param {string} occupation - The occupation of the citizen.
 * @param {number} occupationLevel - The level of the citizen's occupation.
 * @param {number} gold - The amount of gold the citizen has.
 * @return {Object} An object structured to represent a card for Google Chat with the citizen's stats.
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

