/**
 * Creates a dialog for Google Chat that provides information on how to play McKinnonVille and an option to sign up.
 * This dialog includes introductory text and a link to a map, as well as a sign-up button that triggers another dialog.
 *
 * @returns {object} An object formatted to display a dialog in Google Chat, featuring informational content
 *                   and a button for further interaction.
 */
function signUpDialog() {
    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        "header": {
                            "title": "McKinnonVille",
                            "subtitle": "How to play",
                            "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png",
                            "imageType": "CIRCLE"
                        },
                        "sections": [
                            {
                                "header": "",
                                "collapsible": false,
                                "uncollapsibleWidgetsCount": 1,
                                "widgets": [
                                    {
                                        "textParagraph": {
                                            "text": "<a href='https://docs.google.com/spreadsheets/d/1dB8uc2jHt7j_lrytB_GHBB3LaW_WfD-7ldxIHfd7-Z4/edit#gid=73366240'>Click here for map</a><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit amet dolor pretium turpis eleifend aliquet. Sed at metus blandit, cursus nisi sit amet, pellentesque nunc. Etiam quis suscipit lectus. Pellentesque vel orci posuere, feugiat ex et, ullamcorper eros. Maecenas magna sem, ultricies eget mauris vel, aliquet blandit neque. Nunc ante nibh, semper et blandit eget, volutpat et quam. Nunc eu maximus dolor, vel interdum tortor. Donec bibendum nibh nec est tristique semper. Nunc facilisis libero vitae vestibulum interdum."
                                        }
                                    },
                                    {
                                        "buttonList": {
                                            "buttons": [
                                                {
                                                    "text": "Sign up",
                                                    "icon": {
                                                        "iconUrl": "https://cdn-icons-png.flaticon.com/512/5599/5599530.png",
                                                    },
                                                    "onClick": {
                                                        "action": {
                                                            "function": "handleSendOccupationDialog",
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
            }
        }
    };
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
            throw new Error("Sorry, there are no available plots at the moment.")
        }

        // Check if all required parameters are provided
        if (!name || !email || !userId || !spaceId || !house || !occupation) {
            throw new Error("Information missing, please email help@mckinnonsc.vic.edu.au for help.");
        }

        var randomIndex = Math.floor(Math.random() * availablePlots.length);
        var randomPlot = availablePlots[randomIndex];

        // Attempt to fetch or create a new citizen
        var citizen = new Citizen(email, {
            name: name,
            plot: randomPlot,
            house: house,
            occupation: occupation,
            userId: userId,
            spaceId: spaceId
            // Include any additional stats that are relevant during sign-up
        }, true); // Pass true for createIfNotExist to ensure creation if the citizen does not exist

        // Throw an error if citizen does not exist
        if (!citizen.exists()) {
            throw new Error("Failed to create or fetch citizen.");
        }

        var allocatePlotResponse = await allocatePlot(randomPlot);

        // Allocate plot and check if it succeeded
        var allocatePlotResponse = await allocatePlot(randomPlot);
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
        Logger.log(error.message);
        throw error;
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
