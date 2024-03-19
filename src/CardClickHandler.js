function onCardClick(event) {
    if (event.common.invokedFunction === 'signUpClick') {
        return signUp(event.user.displayName, event.user.email, event.user.name, event.space.name);
    }

    if (event.common.invokedFunction === 'submitAnswer') {
        var answerSubmitted = event.action.parameters.find(param => param.key === 'answer').value;
        return sendQuiz(answerSubmitted);
    }
}