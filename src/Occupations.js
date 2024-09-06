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
    const msg = buildOccupationDialog(occupations, house, villageBalance);
    return msg;
    /*
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
    */
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
