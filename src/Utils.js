/**
 * Converts a given column number to its corresponding Excel-style column letter (e.g., 1 -> 'A', 27 -> 'AA').
 * This function uses a modulo operation to handle the conversion, iterating until the entire column number is processed.
 *
 * @param {number} column - The column number to be converted.
 * @returns {string} The corresponding column letter.
 */
function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}
// Function to format the salary value
function formatSalary(salary) {
    if (salary >= 1000) {
        return (salary / 1000) + "k";
    }
    return salary.toString();
}

function generateOccupationStatsString(education, health, happiness, salaryLow, salaryHigh) {
    // Function to generate the bar for a given factor
    function generateBar(factor) {
        let filledBlocks = Math.round(factor * 5); // Each block represents 0.2
        let emptyBlocks = 5 - filledBlocks;
        return '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
    }

    // Function to format the salary value
    function formatSalary(salary) {
        if (salary >= 1000) {
            return (salary / 1000) + "k";
        }
        return salary.toString();
    }

    // Generate bars for each factor
    let educationBar = generateBar(education);
    let healthBar = generateBar(health);
    let happinessBar = generateBar(happiness);

    // Format the salary range
    let formattedSalaryLow = formatSalary(salaryLow);
    let formattedSalaryHigh = formatSalary(salaryHigh);

    // Construct the final string
    let statsString = "📚  " + educationBar + "\n" +
        "🚑  " + healthBar + "\n" +
        "😀  " + happinessBar + "\n" +
        "💰 $" + formattedSalaryLow + " - $" + formattedSalaryHigh;

    return statsString;
}

function generateVillageBalance(education, health, happiness) {
    // Function to generate the bar for a given factor
    function generateBar(factor) {
        let filledBlocks = Math.round(factor); // Round to the nearest integer
        let emptyBlocks = 10 - filledBlocks;
        return '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
    }

    // Generate bars for each factor and return them as an object
    return {
        education: generateBar(education),
        health: generateBar(health),
        happiness: generateBar(happiness)
    };
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
                                    "openLink": {
                                        "url": "https://developers.google.com/chat/ui/widgets/button-list" // Replace with your action URL
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


