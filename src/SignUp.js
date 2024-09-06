const VILLAGE_COLOURS = {
    "gilmore": [120, 0, 0], // Red
    "chisholm": [0, 0, 120], // Blue
    "flynn": [120, 120, 0], // Yellow
    "monash": [0, 120, 0] // Green (duplicate, just for consistency)
};

/**
 * Creates a dialog for Google Chat that provides information on how to play McKinnonVille and an option to sign up.
 * This dialog includes introductory text and a link to a map, as well as a sign-up button that triggers another dialog.
 *
 * @returns {object} An object formatted to display a dialog in Google Chat, featuring informational content
 *                   and a button for further interaction.
 */
function signUpDialog(house) {
    const [red, green, blue] = VILLAGE_COLOURS[house.toLowerCase()] || [0, 0, 0]; // Fallback to black if house is not found

    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body":
                    {
                        "sections": [
                            {
                                "collapsible": false,
                                "widgets": [
                                    {
                                        "image": {
                                            "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/logopineapple0.png"
                                        }
                                    },
                                    {
                                        "textParagraph": {
                                            "text": "McKinnonVille is a game where YOU get to decide the fate of your village! Join forces with your fellow house members (based on your school house group Gilmore, Monash, Flynn, Chisholm) to become the most prosperous village in McKinnonVille."
                                        }
                                    },
                                    {
                                        "textParagraph": {
                                            "text": "Learn more about how to play on our site: mckinnon.sc/mckinnonville"
                                        }
                                    },
                                    {
                                        "columns": {
                                            "columnItems": [
                                                {
                                                    "horizontalSizeStyle": "FILL_AVAILABLE_SPACE",
                                                    "horizontalAlignment": "CENTER",
                                                    "verticalAlignment": "CENTER",
                                                    "widgets": [
                                                        {
                                                            "buttonList": {
                                                                "buttons": [
                                                                    {
                                                                        "text": `Join ${house} Village`,
                                                                        "color": {
                                                                            "red": red,
                                                                            "green": green,
                                                                            "blue": blue
                                                                        },
                                                                        "onClick": {
                                                                            "action": {
                                                                                "function": "handleOccupationSelection",
                                                                            }
                                                                        }
                                                                    }
                                                                ]
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
}


/**
 * Registers a new player in the game.
 *
 * @param {string} name - The name of the player.
 * @param {string} email - The email of the player.
 * @param {string} userId - The user ID of the player.
 * @param {string} spaceId - The space ID of the player.
 * @param {string} house - The house of the player.
 * @param {string} occupation - The occupation of the player.
 * @returns {HTTPResponse|null} - If fails, a HTTPResponse object containing the result of the sign-up process. 
 */
async function signUp(name, email, userId, spaceId, house, occupation) {
    try {
        var availablePlots = await getAvailablePlots(house);

        // Check if there are available plots
        if (availablePlots.length === 0) {
            throw new Error("😳 Uhh, it looks like we've run out of plots. Please email help@mckinnonsc.vic.edu.au and let us know.")
        }

        // Check if all required parameters are provided
        if (!name || !email || !userId || !spaceId || !house || !occupation) {
            throw new Error("Information missing, please email help@mckinnonsc.vic.edu.au for help.");
        }

        var randomIndex = Math.floor(Math.random() * availablePlots.length);
        var randomPlot = availablePlots[randomIndex];

        // Attempt to fetch or create a new citizen
        var citizen = new Citizen(email, true, {
            name: name,
            plot: randomPlot,
            house: house,
            occupation: occupation,
            userId: userId,
            spaceId: spaceId
        }); // Pass true for createIfNotExist to ensure creation if the citizen does not exist

        if (!citizen.exists()) {
            throw new Error("Failed to create or fetch citizen.");
        }

        // Allocate plot and check if it succeeded
        var allocatePlotResponse = await allocatePlot(randomPlot, getImageUrlForSalary(0));
        if (allocatePlotResponse.getResponseCode() !== 200) {
            throw new Error("Failed to allocate plot.");
        }

        // Return an HTTPResponse-like object with the result of the sign-up process
        return {
            statusCode: allocatePlotResponse.getResponseCode(),
            body: allocatePlotResponse.getContentText(),
            getResponseCode: function () {
                return this.statusCode;
            }
        };

    } catch (error) {
        // Handle any errors that occurred during citizen creation or plot allocation
        console.error(error.stack);

        // Return an HTTPResponse-like object with the error message
        return {
            statusCode: 404,
            body: error.message,
            getResponseCode: () => {
                return this.statusCode;
            }
        };
    }
}
