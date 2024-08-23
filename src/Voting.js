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
 * Displays a voting dialog in Google Chat.
 */
function sendVotingDialog(event) {
    const WEEK = 1;  // Specify the week for which voting options should be retrieved
    const options = getVotingOptions(WEEK);

    if (options.length === 0) {
        return {
            "action_response": {
                "type": "NEW_MESSAGE",
                "text": "No voting options are currently available."
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
                            "title": `Week ${WEEK} Ordinance Vote`,
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
    const selectedOptionId = event.common.formInputs.optionId; // Assume the input name is optionId
    const citizenRow = `Citizens!C${event.user.emailRow}`; // Assuming column C is for votes, and we know the row for the user's email

    // Update the spreadsheet with the selected vote
    const sheetRange = `${citizenRow}`;
    const voteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${sheetRange}:append?valueInputOption=USER_ENTERED`;

    const votePayload = JSON.stringify({
        values: [
            [selectedOptionId] // Update the specific cell with the vote id
        ],
    });

    const voteResponse = UrlFetchApp.fetch(voteUrl, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        },
        payload: votePayload,
        muteHttpExceptions: true,
    });

    return {
        "action_response": {
            "type": "NEW_MESSAGE",
            "text": "Your vote has been successfully recorded."
        }
    };
}
