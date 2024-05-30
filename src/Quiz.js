function testF() {
    var q = getQuizQuestions("Law", 1)
    var qs = generateQuizQuestionsWidgets(q)
    Logger.log(qs)
}

function getSubjectsForOccupation(occupation) {
    const occupationsSheetName = 'Occupations';
    const range = encodeURIComponent(`${occupationsSheetName}!B:D`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${range}`;

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
    const result = JSON.parse(response.getContentText());
    const values = result.values;

    if (!values || values.length === 0) {
        Logger.log('No subjects data found.');
        return [];
    }

    // Filter rows by occupation and extract the subjects
    const subjectsRow = values.filter(row => row[0].toLowerCase() === occupation.toLowerCase());
    return subjectsRow.length > 0 ? subjectsRow[0][2].split(',').map(subject => subject.trim()) : [];
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
    const subjects = getSubjectsForOccupation(occupation);
    if (subjects.length === 0) {
        Logger.log('No subjects found for the given occupation.');
        return [];
    }

    const questionsSheetName = 'Test Questions'; // Update this to your actual sheet name for questions
    const range = encodeURIComponent(`${questionsSheetName}!A2:H`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${range}`;

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
    const result = JSON.parse(response.getContentText());
    const values = result.values;

    if (!values || values.length === 0) {
        Logger.log('No quiz data found.');
        return [];
    }

    // Filter questions based on matching any subject and the level
    const filteredQuestions = values.filter(row =>
        subjects.includes(row[1]) && row[2] == level
    ).map(row => ({
        id: row[0],
        question: row[3],
        options: [row[4], row[5], row[6], row[7]],
        answerKey: row[8]
    }));

    // Randomize and limit the number of questions returned
    return filteredQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
}


/**
 * Generates widgets for quiz questions in a Google Chat dialog. Each question is represented
 * as a radio button selection input.
 * 
 * @param {Array} questions - An array of question objects, each containing an `id`, `question` text,
 *                            and `options` array.
 * @returns {Array} An array of widgets formatted for Google Chat dialogs, where each widget
 *                  corresponds to one quiz question.
 */
function generateQuizQuestionsWidgets(questions) {
    const widgets = questions.map((question, index) => ({
        selectionInput: {
            name: `${question.id}`,
            label: `Question ${index + 1}. ${question.question}`,
            type: "RADIO_BUTTON",
            items: question.options.map((option, optionIndex) => ({
                text: `${option}`,
                value: (optionIndex + 1).toString(),
                selected: false
            }))
        }
    }));

    return widgets
}

/**
 * Constructs and sends a quiz dialog based on the occupation and level specified. The quiz questions
 * are fetched based on the occupation and level and then formatted into a dialog for user interaction.
 * 
 * @param {string} occupation - The occupation related to the quiz.
 * @param {number} level - The level of the quiz, typically used to determine the difficulty or context of questions.
 * @returns {object} An object formatted for Google Chat actions, specifically to display a dialog with quiz questions.
 */
function sendQuiz(occupation, level) {
    var questions = getQuizQuestions(occupation, level)

    if (questions.length === 0) {
        return {
            "action_response": {
                "type": "DIALOG",
                "dialog_action": {
                    "dialog": {
                        "body": {
                            "sections": [
                                {
                                    "header": "",
                                    "collapsible": false,
                                    "uncollapsibleWidgetsCount": 1,
                                    "widgets": [
                                        {
                                            "textParagraph": {
                                                "text": "No quiz questions found for the specified occupation and level. Please email help@mckinnonsc.vic.edu.au"
                                            }
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        };
    }

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

/**
 * Evaluates submitted answers against the correct answers stored in a Google Sheet.
 * For each submitted answer, it checks if the answer ID matches the answer key in the sheet.
 * The function returns the count of correct and incorrect answers along with their question IDs.
 *
 * @param {Object} submittedAnswers An object containing question IDs as keys and submitted answer details.
 * The structure for each question's answer is {"": {"stringInputs": {"value": ["answerId"]}}}.
 * @return {Object} An object with two main properties:
 *   - correctAnswers: { count: Number, questionIds: Array }
 *   - incorrectAnswers: { count: Number, questionIds: Array }
 * Each property contains the count of correct or incorrect answers and an array of their respective question IDs.
 */

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