// Command handler map for easy lookup
const commandHandlers = {
    'handleSignUp': handleSignUp,
    'submitAnswer': handleSubmitAnswer,
    'handleSendOccupationDialog': handleSendOccupationDialog,
    'handleQuizSubmission': handleQuizSubmission,
    'handleOccupationSelection': handleOccupationSelection
};

/**
 * Main handler for card clicks in Google Chat. Delegates to specific handlers based on the invoked function.
 */
async function onCardClick(event) {
    const handler = commandHandlers[event.common.invokedFunction];
    if (handler) {
        return handler(event);
    } else {
        return console.error("Unhandled function: " + event.common.invokedFunction);
    }
}

async function handleSendQuiz(event) {
    Logger.info(event)
    Logger.log(event)
    console.log("HELLO WORLD SENDING QUIZ")
    // return sendQuiz()
}

async function handleSignUp(event) {
    return signUp(event.user.displayName, event.user.email, event.user.name, event.space.name);
}

async function handleSubmitAnswer(event) {
    const answerSubmitted = event.action.parameters.find(param => param.key === 'answer').value;
    return sendQuiz(answerSubmitted);
}

async function handleSendOccupationDialog(event) {
    return selectOccupationDialog();
}

async function handleQuizSubmission(event) {
    const quizResults = evaluateSubmittedAnswers(event.common.formInputs);
    return {
        "action_response": {
            "type": "NEW_MESSAGE",
        },
        "text": `You got ${quizResults.correctAnswers.count} out of ${Object.keys(event.common.formInputs).length} questions correct!`
    }
}

async function handleOccupationSelection(event) {
    try {
        const selectedOccupation = event.common.formInputs.occupations[""].stringInputs.value[0];
        const house = await getUserHouse(event.user.email);
        const signUpResponse = await signUp(event.user.displayName, event.user.email, event.user.name, event.space.name, house, selectedOccupation);
        return handleSignUpResponse(signUpResponse, event);
    } catch (error) {
        let userMessage;
        if (error instanceof HouseNotFound) {
            userMessage = `🥺 Sorry ${event.user.displayName.match(/^\S+/)[0]}, it looks like I can't find which house you're in. Send an email to help@mckinnonsc.vic.edu.au and we'll get this sorted for yo.`
        }
        return logErrorAndRespond(error, userMessage || "Error in handleOccupationSelection");
    }
}

function handleSignUpResponse(signUpResponse, event) {
    if (signUpResponse && signUpResponse.getResponseCode() !== 200) {
        return generateErrorResponse("SignUpError: Please email help@mckinnonsc.vic.edu.au with this error message: ", signUpResponse);
    }
    return sendCitizenStatsOrRegistrationMessage(event.user.email);
}

function sendCitizenStatsOrRegistrationMessage(email) {
    const citizen = new Citizen(email);
    if (citizen.exists()) {
        return sendCitizenStatsMessage(citizen.name, citizen.house, citizen.plot, citizen.occupation, citizen.occupationLevel, citizen.gold);
    } else {
        return {
            "action_response": {
                "type": "NEW_MESSAGE",
            },
            "text": "You are not registered to play McKinnonVille. Please try again or email help@mckinnonsc.vic.edu.au"
        }
    };
};

function logErrorAndRespond(error, userMessage) {
    console.error(error.stack);
    return {
        "action_response": {
            "type": "NEW_MESSAGE",
        },
        "text": userMessage
    }
};

function generateErrorResponse(prefix, response) {
    return {
        "action_response": {
            "type": "NEW_MESSAGE",
        },
        "text": `${prefix} ${JSON.stringify(response.body) || JSON.stringify(response)}`
    }
};