// Constants for the Google Sheets range and sheet name that stores occupation data.
const OCCUPATIONS_SHEET_NAME = 'Occupations';
const OCCUPATIONS_RANGE = 'A2:P';


class Occupation {
    constructor(occupationName, stats) {
        this.name = occupationName;
        this.setStats(stats);
    }

    setStats(stats) {
        this.icon = stats[0];            // Column A
        this.name = stats[1];            // Column B
        this.description = stats[2];     // Column C
        this.subjects = stats[3];    // Column D
        this.education = parseFloat(stats[4] || 0); // Column E
        this.health = parseFloat(stats[5] || 0);    // Column F
        this.happiness = parseFloat(stats[6] || 0); // Column G
        this.salary = {
            lower: parseFloat(stats[8] || 0), // Column I
            upper: parseFloat(stats[9] || 0),   // Column J,
            steps: stats.slice(10) // Columns K onwards
        };
    };

    static get(occupationNames) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(OCCUPATIONS_SHEET_NAME + '!' + OCCUPATIONS_RANGE)}`;
        const headers = {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        };
        const options = { method: 'get', headers: headers, muteHttpExceptions: true };
        const response = UrlFetchApp.fetch(url, options);
        const values = JSON.parse(response.getContentText()).values || [];

        // Normalize occupationNames to an array, even if it's a single string
        if (!Array.isArray(occupationNames)) {
            occupationNames = [occupationNames];
        }

        // Create an object to store stats by occupation name
        const occupationsStats = {};
        values.forEach(row => {
            const occupationName = row[1]; // Column B (Occupation Name)
            if (occupationNames.includes(occupationName)) {
                occupationsStats[occupationName] = row; // Store the whole row
            }
        });

        // If only one occupation name was provided, return a single Occupation instance
        if (occupationNames.length === 1) {
            const name = occupationNames[0];
            if (occupationsStats[name]) {
                return new Occupation(name, occupationsStats[name]);
            } else {
                throw new Error(`Occupation '${name}' not found`);
            }
        }

        // For multiple occupation names, return an array of Occupation instances
        return occupationNames.map(name => {
            if (occupationsStats[name]) {
                return new Occupation(name, occupationsStats[name]);
            } else {
                throw new Error(`Occupation '${name}' not found`);
            }
        });
    }
}


/**
 * Fetches and returns a sorted list of occupations from a Google Sheet.
 * Each occupation is expected to have an icon and a name.
 *
 * @returns {Array} An array of occupation objects, sorted alphabetically by name.
 */
function getOccupations() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(OCCUPATIONS_SHEET_NAME + "!" + OCCUPATIONS_RANGE)}`;
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
    const values = JSON.parse(response.getContentText()).values;

    if (values && values.length > 0) {
        // Since we expect each row to have two elements (icon and name), we keep the rows as arrays
        const occupations = values.map(row => ({
            icon: row[0],
            name: row[1]
        }));
        // Sort occupations alphabetically by name
        const sortedOccupations = occupations.sort((a, b) => a.name.localeCompare(b.name));
        return sortedOccupations;
    } else {
        Logger.log('No data found.');
        return [];
    }
}

/**
 * Converts an array of occupation objects into items for a selectionInput.
 * 
 * @param {Array} occupations - An array of occupation objects.
 * @returns {Array} An array of items formatted for display in a selectionInput.
 */
function getOccupationItems(occupations) {
    // Map the occupations to the items format expected by the selectionInput
    const occupationItems = occupations.map(occupation => ({
        text: `${occupation.icon} ${occupation.name}`,
        value: occupation.name,
        selected: false,
    }));
    return occupationItems;
}

function selectOccupationDialog(event) {
    let house;
    try {
        house = getUserHouse(event.user.email);
    } catch (error) {
        let userMessage;
        if (error instanceof HouseNotFound) {
            userMessage = `🥺 Sorry ${event.user.displayName.match(/^\S+/)[0]}, it looks like I can't find which house you're in. Send an email to help @mckinnonsc.vic.edu.au and we'll get this sorted for you.`
        }
        return logErrorAndRespond(error, userMessage || "Error in handleOccupationSelection");
    }

    const occupations = getOccupations();

    if (!occupations) {
        return {
            text: 'Failed to retrieve occupations. Please email help@mckinnonsc.vic.edu.au.',
        };
    }

    const village = Village.get(house);
    const villageBalance = generateVillageBalance(village.education, village.health, village.happiness);

    const msg = {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        "header": {
                            "title": "Choose your occupation"
                        },
                        "sections": [
                            {
                                "widgets": [
                                    {
                                        "textParagraph": {
                                            "text": `To win McKinnonVille, your village ${house} needs to balance Education, Health and Happiness.  Each occupation impacts these stats, make sure to check what your village needs and whatever you choose you will be tested on each week to seek promotion. The higher the salary the nicer the [house] you can afford.`
                                        }
                                    },
                                    {
                                        "textParagraph": {
                                            "text": `<b>${house}'s Village Balance</b>`
                                        }
                                    },
                                    {
                                        "decoratedText": {
                                            "topLabel": "📚 Education",
                                            "text": villageBalance.education
                                        }
                                    },
                                    {
                                        "decoratedText": {
                                            "topLabel": "🚑 Health",
                                            "text": villageBalance.health
                                        }
                                    },
                                    {
                                        "decoratedText": {
                                            "topLabel": "😀 Happiness",
                                            "text": villageBalance.happiness
                                        }
                                    },
                                    {
                                        "textParagraph": {
                                            "text": "<b>View detailed stats on the [McKinnonville Map]</b>"
                                        }
                                    },
                                    {
                                        "divider": {}
                                    },
                                    {
                                        "columns": {
                                            "columnItems": [
                                                {
                                                    "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
                                                    "horizontalAlignment": "CENTER",
                                                    "verticalAlignment": "CENTER",
                                                    "widgets": [
                                                        {
                                                            "image": {
                                                                "imageUrl": "https://i.imgur.com/tSG1ayx.png",
                                                                "altText": "Teacher"
                                                            }
                                                        },
                                                        {
                                                            "buttonList": {
                                                                "buttons": [
                                                                    {
                                                                        "text": "Teacher",
                                                                        "onClick": {
                                                                            "openLink": {
                                                                                "url": "https://developers.google.com/chat/ui/widgets/button-list"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            "textParagraph": {
                                                                "text": "📚  🟩🟩🟩🟩🟩\n🚑  🟩🟩🟩🟩🟩\n😀  🟩🟩🟩⬛⬛️\n💰 $28k-$80k"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
                                                    "horizontalAlignment": "CENTER",
                                                    "verticalAlignment": "CENTER",
                                                    "widgets": [
                                                        {
                                                            "image": {
                                                                "imageUrl": "https://i.imgur.com/tSG1ayx.png",
                                                                "altText": "Teacher"
                                                            }
                                                        },
                                                        {
                                                            "buttonList": {
                                                                "buttons": [
                                                                    {
                                                                        "text": "Chef",
                                                                        "onClick": {
                                                                            "openLink": {
                                                                                "url": "https://developers.google.com/chat/ui/widgets/button-list"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            "textParagraph": {
                                                                "text": "📚  🟩🟩🟩🟩🟩\n🚑  🟩🟩🟩🟩🟩\n😀  🟩🟩🟩⬛⬛️\n💰 $28k-$80k"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "columns": {
                                            "columnItems": [
                                                {
                                                    "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
                                                    "horizontalAlignment": "CENTER",
                                                    "verticalAlignment": "CENTER",
                                                    "widgets": [
                                                        {
                                                            "image": {
                                                                "imageUrl": "https://i.imgur.com/IYKIW7l.png",
                                                                "altText": "Athlete"
                                                            }
                                                        },
                                                        {
                                                            "buttonList": {
                                                                "buttons": [
                                                                    {
                                                                        "text": "Athlete",
                                                                        "onClick": {
                                                                            "openLink": {
                                                                                "url": "https://developers.google.com/chat/ui/widgets/button-list"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            "textParagraph": {
                                                                "text": "📚  🟩🟩🟩🟩🟩\n🚑  🟩🟩🟩🟩🟩\n😀  🟩🟩🟩⬛⬛️\n💰 $28k-$80k"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
                                                    "horizontalAlignment": "CENTER",
                                                    "verticalAlignment": "CENTER",
                                                    "widgets": [
                                                        {
                                                            "image": {
                                                                "imageUrl": "https://i.imgur.com/pfc1VZC.png",
                                                                "altText": "Doctor"
                                                            }
                                                        },
                                                        {
                                                            "buttonList": {
                                                                "buttons": [
                                                                    {
                                                                        "text": "Doctor",
                                                                        "onClick": {
                                                                            "openLink": {
                                                                                "url": "https://developers.google.com/chat/ui/widgets/button-list"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            "textParagraph": {
                                                                "text": "📚  🟩🟩🟩🟩🟩\n🚑  🟩🟩🟩🟩🟩\n😀  🟩🟩🟩⬛⬛️\n💰 $28k-$80k"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    }
    return msg;
}

/**
 * Generates a dialog for user to select an occupation using a dropdown menu in Google Chat.
 * 
 * @returns {object} An object formatted for triggering a dialog in Google Chat with a selectionInput.
 */
function oldselectOccupationDialog() {
    const occupations = getOccupations();

    if (!occupations) {
        return {
            text: 'Failed to retrieve occupations. Please email help@mckinnonsc.vic.edu.au.',
        };
    }

    // Map the occupations to the items format expected by the selectionInput
    const occupationItems = getOccupationItems(occupations)
    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        sections: [
                            {
                                header: 'Select your occupation',
                                widgets: [
                                    {
                                        textParagraph: {
                                            "text": "You now need to select an occupation. This will determine your role in the McKinnonVille."
                                        },
                                    }, {
                                        selectionInput: {
                                            type: 'DROPDOWN',
                                            label: 'Occupations',
                                            name: 'occupations',
                                            items: occupationItems,
                                            onChangeAction: {
                                                function: 'handleOccupationSelection',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    }
                }
            }
        }
    }
}
