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
        var house = getUserHouse(event.user.email);
        return signUpDialog(house);
    }
}


function slashTest(event) {
    const msg = '';
    return msg;
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
    const currentWeek = getWeek();

    // Fetch the current attempts for the week
    const currentAttempts = citizen.getQuizAttempts(currentWeek);

    if (currentAttempts >= QUIZ_MAX_ATTEMPTS) {
        const nextWeekStartDate = getNextWeekStartDate(currentWeek);
        const message = `You have reached your quiz attempt limit for this week. You can try again next week starting from ${nextWeekStartDate}.`;
        sendMessage(message, citizen.spaceId);
        return;
    }

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