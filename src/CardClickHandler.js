/**
 * Handles user interactions with interactive cards in Google Chat.
 * Based on the function invoked from the card, this handler routes to specific actions like sign-ups,
 * quiz submissions, and occupation selections, providing appropriate responses or actions.
 *
 * @param {object} event - The event object containing details of the user interaction, including
 *                         which function was invoked and any relevant parameters or inputs.
 *
 * @returns {Promise<object>} A Promise that resolves to an object containing the response action,
 *                            which might be a new message to the user or a dialog.
 *
 * @example
 * // Example event object for a quiz submission:
 * {
 *   "common": {
 *     "invokedFunction": "submitAnswer"
 *   },
 *   "action": {
 *     "parameters": [
 *       {
 *         "key": "answer",
 *         "value": "42"
 *       }
 *     ]
 *   }
 * }
 */
async function onCardClick(event) {
    const invokedFunction = event.common.invokedFunction;

    // Handle sign-up actions
    if (invokedFunction === 'handleSignUp') {
        return signUp(event.user.displayName, event.user.email, event.user.name, event.space.name);
    }

    // Process submitted answers for a quiz
    if (invokedFunction === 'submitAnswer') {
        var answerSubmitted = event.action.parameters.find(param => param.key === 'answer').value;
        return sendQuiz(answerSubmitted);
    }

    // Open a dialog for occupation selection
    if (invokedFunction === 'handleSendOccupationDialog') {
        return selectOccupationDialog();
    }

    // Evaluate quiz submissions and send a response message with the results
    if (invokedFunction === 'handleQuizSubmission') {
        var quizResults = evaluateSubmittedAnswers(event.common.formInputs);
        return {
            "action_response": {
                "type": "NEW_MESSAGE",
            },
            "text": `You got ${quizResults.correctAnswers.count} out of ${Object.keys(event.common.formInputs).length} questions correct!`
        }
    }

    // Handle occupation selection, including fetching user's house
    if (invokedFunction === 'handleOccupationSelection') {
        var selectedOccupation = event.common.formInputs.occupations[""].stringInputs.value[0];

        var house;
        try {
            house = getUserHouse(event.user.email);
        } catch (error) {
            console.error(error.stack);
            return {
                "action_response": {
                    "type": "NEW_MESSAGE",
                },
                "text": `🥺 Sorry ${event.user.displayName.match(/^\S+/)[0]}!, I can't seem to find which house you're in. Please email help@mckinnonsc.vic.edu.au and we'll sort it out for you.`
            };
        }

        try {
            var signUpResponse = await signUp(event.user.displayName, event.user.email, event.user.name, event.space.name, house, selectedOccupation);
            if (signUpResponse && signUpResponse.getResponseCode() !== 200) {
                console.error(error.stack)
                return {
                    "action_response": {
                        "type": "NEW_MESSAGE",
                    },
                    "text": `SignUpError: Please email help@mckinnonsc.vic.edu.au with this error message: ${JSON.stringify(signUpResponse.body) || JSON.stringify(error.message)}`
                };
            }
        } catch (error) {
            console.error(error.stack)
            return {
                "action_response": {
                    "type": "NEW_MESSAGE",
                },
                "text": `UnknownError: Please email help@mckinnonsc.vic.edu.au with this error message: ${JSON.stringify(signUpResponse) || JSON.stringify(error.message)}`
            };
        }
    }

    // // Fetch and send citizen statistics if the user is already registered
    // var citizen = new Citizen(event.user.email);
    // if (citizen) {
    //     return sendCitizenStatsMessage(
    //         citizen.name,
    //         citizen.house,
    //         citizen.plot,
    //         citizen.occupation,
    //         citizen.occupationLevel,
    //         citizen.gold
    //     );
    // } else {
    //     return {
    //         "action_response": {
    //             "type": "NEW_MESSAGE",
    //         },
    //         "text": "You are not registered to play McKinnonVille. Please try again or email help@mckinnonsc.vic.edu.au"
    //     }
    // }
}
