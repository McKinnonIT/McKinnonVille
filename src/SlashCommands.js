/**
 * Handles the `/play` slash command in Google Chat. Checks if the user is already registered 
 * as a citizen of McKinnonVille and displays a dialog informing them that they are registered and 
 * suggesting to check their stats. If not registered, it initiates the sign-up process.
 *
 * @param {object} event - The event object containing details about the user.
 * @returns {object} A Google Chat action response object for displaying a dialog or initiating sign-up.
 */
function slashPlay(event) {
    var citizen = new Citizen(event.user.email);
    if (citizen.exists()) {
        return {
            "action_response": {
                "type": "DIALOG",
                "dialog_action": {
                    "dialog": {
                        "body": {
                            "sections": [
                                {
                                    "header": "",
                                    "collapsible": false,
                                    "uncollapsibleWidgetsCount": 1,
                                    "widgets": [
                                        {
                                            "textParagraph": {
                                                "text": "You are already registered to play McKinnonVille. Type /stats to see your stats."
                                            }
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        };
    } else {
        return signUpDialog(event);
    }
}

function slashTest(event) {
    return selectOccupationDialog(event);
}

/**
 * Responds to the `/quiz` slash command in Google Chat by sending a quiz based on the user's
 * occupation and their level. Assumes that the user is already registered as a citizen.
 *
 * @param {object} event - The event object containing details about the user.
 * @returns {object} A Google Chat action response object to send a quiz dialog based on the user's occupation and level.
 */
function slashQuiz(event) {
    var citizen = new Citizen(event.user.email);
    return sendQuiz(citizen.occupation, citizen.occupationLevel);
}

/**
 * Handles the `/stats` slash command in Google Chat. If the user is registered as a citizen, it
 * displays their stats including name, house, plot, occupation, occupation level, and gold. If not registered,
 * informs the user that they need to register to play McKinnonVille.
 *
 * @param {object} event - The event object containing details about the user.
 * @returns {object} A Google Chat action response object to display user stats or a registration prompt.
 */
function slashStats(event) {
    var citizen = new Citizen(event.user.email);
    if (citizen.exists()) {
        return sendCitizenStatsMessage(
            citizen.name,
            citizen.house,
            citizen.plot,
            citizen.occupation,
            citizen.occupationLevel,
            citizen.gold
        );
    } else {
        return {
            "text": "You are not registered to play McKinnonVille. Type /play to sign up!"
        }
    }
}

function slashVote(event) {
    return sendVotingDialog(event);
}