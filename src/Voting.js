const VOTE_SUBMISSION_COLUMN_MAP = {
    1: "O",
    2: "P",
    3: "Q",
    4: "R",
    5: "S",
    6: "T",
    7: "U",
    8: "V",
    9: "W",
};

function getVotingOptions(week) {
    const sheetName = 'Ordinance Votes';
    const range = encodeURIComponent(`${sheetName}!A2:D`);  // Adjust to include all necessary columns
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
        Logger.log('No voting options found.');
        return [];
    }

    // Filter rows by the specified week and map them to extract the relevant data
    const weeklyOptions = values.filter(row => parseInt(row[0]) === week).map(row => ({
        id: row[1],  // Option number within the week
        name: row[2],  // Name of the vote
        description: row[3]  // Description of what the vote entails
    }));

    // Return only the first three options for the week
    return weeklyOptions.slice(0, 3);
}



/**
 * Generates widgets for voting options in a Google Chat dialog.
 * @param {Array} options - An array of voting option objects.
 * @returns {Array} An array of widgets formatted for Google Chat dialogs.
 */
function generateVotingWidgets(options) {
    return [{
        selectionInput: {
            name: "voteOption",
            type: "RADIO_BUTTON",
            items: options.map(option => ({
                text: `${option.name}
                ${option.description}`, value: String(option.id)
            }))
        }
    }];
}

/**
 * Displays a voting dialog in Google Chat or responds with a message if the user has already voted.
 * @param {Object} event - The event object from Google Chat.
 * @return {Object} - The response object for Google Chat.
 */
function sendVotingDialog(event) {
    const week = getWeek();
    const email = event.user.email; // Assuming the event object contains the user's email
    const existingVote = getCitizenVote(email, week);

    Logger.log(`Week: ${week}, Email: ${email}, Existing Vote: ${existingVote}`);
    if (existingVote !== null) {
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
                                                "text": `You have already submitted a vote for this ordinance.`
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


    const options = getVotingOptions(week);

    if (options.length === 0) {
        return {
            "action_response": {
                "type": "NEW_MESSAGE",
            },
            "text": "No voting options are currently available."
        };

    }

    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        "header": {
                            "title": `Week ${week} Ordinance Vote`,
                            "subtitle": "Please select one of the following options to vote on."
                        },
                        "sections": [{
                            "widgets": generateVotingWidgets(options)
                        }],
                        "fixedFooter": {
                            "primaryButton": {
                                "text": "Submit Vote",
                                "onClick": {
                                    "action": {
                                        "function": "handleVoteSubmission",
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}



/**
 * Handles the submission of a vote and records it to the "Citizens" sheet.
 * @param {Object} event - Event containing the vote selection from the user.
 */
function handleVoteSubmission(event) {
    const selectedOptionId = event.common.formInputs.voteOption[""].stringInputs.value[0];
    const week = getWeek(); // Function to determine the current week, which needs to be implemented

    updateVote(event.user.email, week, selectedOptionId);

    return {
        "action_response": {
            "type": "NEW_MESSAGE",
        },
        "text": "Your vote has been successfully recorded."
    };
}

/**
 * Updates the vote in the sheet for a specific citizen and week.
 * @param {string} email - The citizen's email.
 * @param {number} week - The week number for which the vote is being updated.
 * @param {string} selectedOptionId - The vote option selected by the citizen.
 * @return {boolean} - True if the update was successful, false otherwise.
 */
function updateVote(email, week, selectedOptionId) {
    const column = VOTE_SUBMISSION_COLUMN_MAP[week]; // A map of weeks to columns
    const sheetName = "Citizens";
    const citizenRow = getCitizenRow(email)


    if (!citizenRow) {
        Logger.log(`Email ${email} not found in the Citizens sheet.`);
        return false;
    }

    const cell = `${column}${citizenRow}`;

    const votePayload = JSON.stringify({
        values: [[selectedOptionId]],
    });

    const voteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${sheetName}!${cell}?valueInputOption=USER_ENTERED`;
    const voteResponse = UrlFetchApp.fetch(voteUrl, {
        method: 'put',
        headers: {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        },
        payload: votePayload,
        muteHttpExceptions: true,
    });

    Logger.log(`Vote response for email ${email}: ${voteResponse.getContentText()} at cell ${cell}`);
    return voteResponse.getResponseCode() === 200;
}

/**
 * Retrieves the vote for a given citizen and week from the "Citizens" sheet.
 * @param {string} email - The email of the citizen.
 * @param {number} week - The week number for which to retrieve the vote.
 * @return {string|null} - The vote option ID if found, or null if not found.
 */
function getCitizenVote(email, week) {
    const sheetName = 'Citizens';
    const column = VOTE_SUBMISSION_COLUMN_MAP[week]; // A map of weeks to columns
    const rowIndex = getCitizenRow(email);

    if (rowIndex === null) {
        Logger.log(`Email ${email} not found in the Citizens sheet.`);
        return null;
    }

    const cellRange = `${sheetName}!${column}${rowIndex}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(cellRange)}`;
    const options = {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: false,
    };

    const response = UrlFetchApp.fetch(url, options);
    const values = JSON.parse(response.getContentText()).values || [];

    if (values.length === 0 || values[0].length === 0) {
        Logger.log(`No vote recorded for email ${email} in week ${week}.`);
        return null;
    }

    return values[0][0];
}
