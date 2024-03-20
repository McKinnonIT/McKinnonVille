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

    if (invokedFunction === 'handleOccupationSelection') {
        var selectedOccupation = event.common.formInputs.occupations[""].stringInputs.value[0];
        signUp(event.user.displayName, event.user.email, event.user.name, event.space.name, "Gilmore", selectedOccupation);
        return getCitizenStats();
        // return {
        //     "action_response": {
        //         "type": "NEW_MESSAGE",
        //     },
        //     "text": `Sign up successful! You are now a ${selectedOccupation}.`
        // }
    }

}