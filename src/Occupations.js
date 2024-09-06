// Constants for the Google Sheets range and sheet name that stores occupation data.
const OCCUPATIONS_SHEET_NAME = 'Occupations';
const OCCUPATIONS_RANGE = 'A2:P';


class Occupation {
    constructor(occupationName, stats) {
        this.name = occupationName;
        this.setStats(stats);
    }

    setStats([icon, name, description, subjects, education = 0, health = 0, happiness = 0, imageUrl, lowerSalary = 0, upperSalary = 0, ...salarySteps]) {
        this.icon = icon;
        this.name = name;
        this.description = description;
        this.subjects = subjects;
        this.education = parseFloat(education);
        this.health = parseFloat(health);
        this.happiness = parseFloat(happiness);
        this.imageUrl = imageUrl;
        this.salary = {
            lower: parseFloat(lowerSalary),
            upper: parseFloat(upperSalary),
            steps: salarySteps
        };
    }

    static normalizeName(name) {
        return name.toLowerCase().replace(/\s+/g, '_'); // Replace spaces with underscores
    }

    static getOccupationData() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(OCCUPATIONS_SHEET_NAME + '!' + OCCUPATIONS_RANGE)}`;
        const headers = {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        };
        const options = { method: 'get', headers: headers, muteHttpExceptions: true };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText()).values || [];
    }

    static get(occupationNames = []) {
        if (!Array.isArray(occupationNames)) {
            throw new Error('Occupation names must be an array');
        }

        const values = this.getOccupationData();
        const occupations = values.reduce((acc, row) => {
            const occupationName = row[1]; // Column B (Occupation Name)
            const normalizedName = Occupation.normalizeName(occupationName);
            acc[normalizedName] = new Occupation(occupationName, row);
            return acc;
        }, {});

        // Always return as an object
        if (occupationNames.length === 0) {
            return occupations; // Return all occupations as an object
        }

        const result = {};
        occupationNames.forEach(name => {
            const normalized = Occupation.normalizeName(name);
            if (occupations[normalized]) {
                result[normalized] = occupations[normalized];
            } else {
                throw new Error(`Occupation '${name}' not found`);
            }
        });

        return result;
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

    const occupations = Occupation.get();

    if (!occupations) {
        return {
            text: 'Failed to retrieve occupations. Please email help@mckinnonsc.vic.edu.au.',
        };
    }

    const village = Village.get(house);
    const villageBalance = generateVillageBalance(village.education, village.health, village.happiness);
    return buildOccupationDialog(occupations, house, villageBalance);
}

function buildOccupationDialog(occupations, house, villageBalance) {
    // Helper function to generate the occupation stats for the dialog
    function generateOccupationWidget(occupation) {
        return {
            "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
            "horizontalAlignment": "CENTER",
            "verticalAlignment": "CENTER",
            "widgets": [
                {
                    "image": {
                        "imageUrl": occupation.imageUrl, // Icon URL for occupation
                        "altText": occupation.name
                    }
                },
                {
                    "buttonList": {
                        "buttons": [
                            {
                                "text": occupation.name,
                                "onClick": {
                                    "action": {
                                        "function": "handleOccupationSelection",
                                        "parameters": [{
                                            "key": "occupation",
                                            "value": occupation.name
                                        }]
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "textParagraph": {
                        "text": generateOccupationStatsString(occupation.education, occupation.health, occupation.happiness, occupation.salary.lower, occupation.salary.upper)
                    }
                }
            ]
        };
    }

    // Helper function to generate a bar display based on value
    function generateBar(stat) {
        const filled = Math.floor(stat);  // Number of filled squares
        const empty = 5 - filled;         // Number of empty squares
        return '🟩'.repeat(filled) + '⬛️'.repeat(empty);
    }

    // Add a placeholder to keep an even number of columnItems
    function ensureEvenColumnItems(columnItems) {
        if (columnItems.length % 2 !== 0) {
            columnItems.push({
                "horizontalSizeStyle": "FILL_MINIMUM_SPACE",
                "horizontalAlignment": "CENTER",
                "verticalAlignment": "CENTER",
                "widgets": [
                    {
                        "textParagraph": {
                            "text": " " // Empty space as a placeholder
                        }
                    }
                ]
            });
        }
        return columnItems;
    }

    // Convert occupations object to array and map to generate widgets
    const occupationWidgets = Object.values(occupations).map(generateOccupationWidget);

    // Ensure we have an even number of column items
    const columnItems = ensureEvenColumnItems(occupationWidgets);

    // Build dialog with sections and widgets
    return {
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
                                            "text": `To win McKinnonVille, your village ${house} needs to balance Education, Health and Happiness. Each occupation impacts these stats, make sure to check what your village needs and whatever you choose, you will be tested on each week to seek promotion. The higher the salary, the nicer the ${house} you can afford.`
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
                                            "text": "<b>View detailed stats on the McKinnonville Map</b>"
                                        }
                                    },
                                    {
                                        "divider": {}
                                    },
                                    {
                                        "columns": {
                                            "columnItems": columnItems // Even number of column items
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    };
}

