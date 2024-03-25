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
                                            "text": "<a href=https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png>Click here for map</a><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit amet dolor pretium turpis eleifend aliquet. Sed at metus blandit, cursus nisi sit amet, pellentesque nunc. Etiam quis suscipit lectus. Pellentesque vel orci posuere, feugiat ex et, ullamcorper eros. Maecenas magna sem, ultricies eget mauris vel, aliquet blandit neque. Nunc ante nibh, semper et blandit eget, volutpat et quam. Nunc eu maximus dolor, vel interdum tortor. Donec bibendum nibh nec est tristique semper. Nunc facilisis libero vitae vestibulum interdum."
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
function signUp(name, email, userId, spaceId, house, occupation) {
    var availablePlots = getAvailablePlots();

    // Check if there are available plots
    if (availablePlots.length === 0) {
        return { text: `Sorry, there are no available plots at the moment.` };
    }

    // Check if all required parameters are provided
    if (!name || !email || !userId || !spaceId || !house || !occupation) {
        return { text: `Information missing, please email help@mckinnonsc.vic.edu.au for help.` };
    }

    var randomIndex = Math.floor(Math.random() * availablePlots.length);
    var randomPlot = availablePlots[randomIndex];

    try {
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

        return allocatePlot(randomPlot);

    } catch (error) {
        // Handle any errors that occurred during citizen creation or plot allocation
        Logger.log(error.message);
        return { text: `An error occurred: ${error.message}` };
    }
}
