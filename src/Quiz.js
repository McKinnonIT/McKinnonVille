function testF() {
    var q = getQuizQuestions("Law", 1)
    var qs = generateQuizQuestionsWidgets(q)
    Logger.log(qs)
}

/**
 * Retrieves a specified number of quiz questions filtered by occupation and level from a Google Sheet.
 * The questions are randomly selected and limited to the specified number if there are more available.
 * 
 * The Google Sheet should follow a specific format with columns:
 * [Question ID, Occupation, Level, Question, Option 1, Option 2, Option 3, Option 4, Answer Key]
 * 
 * @param {string} occupation The occupation to filter questions by.
 * @param {number} level The difficulty level of the questions to retrieve.
 * @param {number} [numQuestions=5] (Optional) The maximum number of questions to retrieve. Defaults to 5.
 * @return {Array<Object>} An array of question objects, each containing the question, options, and answer key.
*/
function getQuizQuestions(occupation, level, numQuestions = 5) {
    const sheetName = 'Test Questions'; // Update this to your actual sheet name
    const range = encodeURIComponent(`${sheetName}!A2:H`); // Adjust range as necessary
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;

    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true,
    };

    // Fetching the data from the sheet
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    const values = result.values;

    // Check if we have received any data
    if (!values || values.length === 0) {
        Logger.log('No data found.');
        return [];
    }

    // Filter and map the questions based on occupation and level
    const filteredQuestions = values.filter(row => row[1] === occupation && row[2] == level).map(row => ({
        id: row[0],
        question: row[3],
        options: [row[4], row[5], row[6], row[7]],
        answerKey: row[8]
    }));

    // Randomize and limit the number of questions returned
    return filteredQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
}


function generateQuizQuestionsWidgets(questions) {
    const widgets = questions.map((question, index) => ({
        selectionInput: {
            name: `${question.id}`,
            label: `Question ${index + 1}. ${question.question}`,
            type: "RADIO_BUTTON",
            items: question.options.map((option, optionIndex) => ({
                text: `${option}`,
                value: (optionIndex + 1).toString(),
                selected: true
            }))
        }
    }));

    return widgets
}

function sendQuiz(occupation, level) {
    var questions = getQuizQuestions(occupation, level)

    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        "header": {
                            "title": `${occupation} Quiz (Level ${level})`,
                            "subtitle": `Level ${level}`,
                            "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png",
                            "imageType": "CIRCLE"
                        },
                        "fixedFooter": {
                            "primaryButton": {
                                "text": "Submit",
                                "color": {
                                    "red": 0,
                                    "green": 0.5,
                                    "blue": 1,
                                    "alpha": 1
                                },
                                "onClick": {
                                    "action": {
                                        "function": "handleQuizSubmission",
                                    }
                                }
                            },
                        },
                        "sections": [
                            {
                                "header": "",
                                "collapsible": false,
                                "uncollapsibleWidgetsCount": 1,
                                "widgets": generateQuizQuestionsWidgets(questions)
                            }
                        ]
                    }
                }
            }
        }
    }
}