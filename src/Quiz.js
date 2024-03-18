function sendQuiz(excludeAnswer = '') {
    var answers = ["Constitution", "Declaration of Independence", "The Federalist Papers", "Articles of Confederation"];

    // Filter out the excluded answer
    if (excludeAnswer) {
        answers = answers.filter(answer => answer !== excludeAnswer);
    }

    var card = {
        "actionResponse": {
            "type": "UPDATE_MESSAGE"
        },
        cards: [
            {
                header: {
                    title: "Law Quiz",
                    subtitle: "What is the supreme law of the land in the United States?"
                },
                sections: [
                    {
                        widgets: [
                            {
                                buttons: answers.map(answer => createButton(answer, "submitAnswer"))
                            }
                        ]
                    }
                ]
            }
        ]
    };
    return card;
}

function createButton(answer, actionMethodName) {
    return {
        textButton: {
            text: answer,
            onClick: {
                action: {
                    actionMethodName: actionMethodName,
                    parameters: [
                        {
                            key: "answer",
                            value: answer
                        }
                    ]
                }
            }
        }
    };
}
