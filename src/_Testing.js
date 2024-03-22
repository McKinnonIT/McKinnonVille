function testCitizen() {
    try {
        const citizenEmail = "sam.neal@mckinnonsc.vic.edu.au";
        const citizen = new Citizen(citizenEmail);
        Logger.log(citizen);
    } catch (error) {
        Logger.log(error.message);
    }
}

function testFunc() {
    return null
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