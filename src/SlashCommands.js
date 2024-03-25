function slashPlay(event) {
    return signUpDialog(event);
}

function slashTest(event) {
    return sendQuiz("Art", 1);
    // return selectOccupationDialog(event);
}

function slashQuiz(event) {
    var citizen = new Citizen(event.user.email);
    return sendQuiz(citizen.occupation, citizen.occupationLevel);
}

function slashStats(event) {
    var citizen = new Citizen(event.user.email);
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
            "text": "You are not registered to play McKinnonVille. Type /play to sign up!"
        }
    }
}