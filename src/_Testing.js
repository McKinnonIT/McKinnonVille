function testCitizen() {
    var newCitizen = new Citizen("new.email@example.com", {
        name: "Default Name",
        plot: "AA00",
        house: "Gilmore",
        gold: 0,
        plotLevel: 1,
        occupationLevel: 1,
        occupation: "Teacher"
    }, true);
    Logger.log(newCitizen);

    // Trying to fetch a citizen without creating a new one if they don't exist
    // var existingCitizen = new Citizen("sam.neal@mckinnonsc.vic.edu.au", {}, false);
    // Logger.log(existingCitizen);
}



function evaluateSubmittedAnswers(submittedAnswers) {
    const sheetName = 'Test Questions';
    const range = `${sheetName}!A:I`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };
    const options = {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const { values } = JSON.parse(response.getContentText());

    let correctCount = 0;
    const correctQuestions = [];
    const incorrectQuestions = [];

    Object.entries(submittedAnswers).forEach(([questionId, { "": { stringInputs: { value: [submittedAnswerId] } } }]) => {
        const questionRow = values.find(row => row[0] === questionId);
        if (questionRow && questionRow[8] === submittedAnswerId) { // Assuming answer keys are in column I (index 8)
            correctCount++;
            correctQuestions.push(questionId);
        } else {
            incorrectQuestions.push(questionId);
        }
    });

    return {
        correctAnswers: {
            count: correctCount,
            questionIds: correctQuestions,
        },
        incorrectAnswers: {
            count: incorrectQuestions.length,
            questionIds: incorrectQuestions,
        },
    };
}