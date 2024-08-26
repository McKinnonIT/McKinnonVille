// Command handler map for easy lookup
const commandHandlers = {
    'handleSignUp': handleSignUp,
    'submitAnswer': handleSubmitAnswer,
    'handleSendOccupationDialog': handleSendOccupationDialog,
    'handleQuizSubmission': handleQuizSubmission,
    'handleOccupationSelection': handleOccupationSelection,
    'handleVoteSubmission': handleVoteSubmission,
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
    const totalQuestions = Object.keys(event.common.formInputs).length;
    const correctAnswers = quizResults.correctAnswers.count;

    const citizen = new Citizen(event.user.email);
    citizen.incrementQuizAttempts();

    let remainingAttempts = Math.max(0, QUIZ_MAX_ATTEMPTS - citizen.getQuizAttempts());

    let message;
    if (correctAnswers === totalQuestions) {
        message = `You answered all ${totalQuestions} questions correctly!`;
        citizen.levelUp();
    } else {
        message = `You answered ${correctAnswers} out of ${totalQuestions} questions correctly.`;
    }

    return {
        "action_response": {
            "type": "NEW_MESSAGE",
        },
        "text": correctAnswers === totalQuestions ? message : `${message} You have ${remainingAttempts} attempts left for this week.`
    };
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
            userMessage = `🥺 Sorry ${event.user.displayName.match(/^\S+/)[0]}, it looks like I can't find which house you're in.Send an email to help @mckinnonsc.vic.edu.au and we'll get this sorted for yo.`
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