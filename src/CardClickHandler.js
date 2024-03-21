function onCardClick(event) {
    const invokedFunction = event.common.invokedFunction
    if (invokedFunction === 'handleSignUp') {
        return signUp(event.user.displayName, event.user.email, event.user.name, event.space.name);
    }

    if (invokedFunction === 'submitAnswer') {
        var answerSubmitted = event.action.parameters.find(param => param.key === 'answer').value;
        return sendQuiz(answerSubmitted);
    }

    if (invokedFunction === 'handleSendOccupationDialog') {
        return selectOccupationDialog();
    }

    if (invokedFunction === 'handleQuizSubmission') {
        return {
            "action_response": {
                "type": "NEW_MESSAGE",
            },
            "text": `${JSON.stringify(event.common.formInputs)}`
        }
        // return markQuiz(event);
    }

    if (invokedFunction === 'handleOccupationSelection') {
        var selectedOccupation = event.common.formInputs.occupations[""].stringInputs.value[0];
        var signUpResponse = signUp(event.user.displayName, event.user.email, event.user.name, event.space.name, "Gilmore", selectedOccupation);
        if (signUpResponse.getResponseCode() !== 200) {
            return {
                "action_response": {
                    "type": "NEW_MESSAGE",
                },
                "text": "Sign up failed. Please email help@mckinnonsc.vic.edu.au"
            }
        }

        var citizen = getCitizenStats(event.user.email);
        if (citizen) {
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
                "action_response": {
                    "type": "NEW_MESSAGE",
                },
                "text": "You are not registered to play McKinnonVille. Please try again or email help@mckinnonsc.vic.edu.au"
            }
        }
    }
}