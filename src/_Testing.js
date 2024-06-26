async function testCitizen() {
    var citizen = new Citizen("sam.neal@mckinnonsc.vic.edu.au")
    console.log(citizen)
    console.log(citizen.exists())

    // var house = getUserHouse("sam.neal@mckinnonsc.vic.edu.au")
    // console.log(house)
    // var signUpResponse = await signUp("Sam Neal", "sam.neal@mckinnonsc.vic.edu.au", "users/107937830411654453433", "spaces/-m3q0MAAAAE", house, "Engineer");
    // console.log(signUpResponse)

    // get and log a citizens house
    // var house = getUserHouse("sam.neal@mckinnonsc.vic.edu.au")
    // Logger.log(house)

    // var availablePlots = getAvailablePlots();
    // Logger.log(availablePlots);
    // var citizen = new Citizen("sam.neal@mckinnonsc.vic.edu.au")
    // Logger.log(citizen.exists())
    // Logger.log(citizen)
    // var newCitizen = new Citizen("new.email@example.com", {
    //     name: "Default Name",
    //     plot: "AA00",
    //     house: "Gilmore",
    //     gold: 0,
    //     plotLevel: 1,
    //     occupationLevel: 1,
    //     occupation: "Teacher"
    // }, true);
    // Logger.log(newCitizen);

    // Trying to fetch a citizen without creating a new one if they don't exist
    // var existingCitizen = new Citizen("sam.neal@mckinnonsc.vic.edu.au", {}, false);
    // Logger.log(existingCitizen);
}



function evaluateSubmittedAnswers(submittedAnswers) {
    const sheetName = 'Test Questions';
    const range = `${sheetName}!A:I`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(range)}`;
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