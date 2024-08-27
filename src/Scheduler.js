/**
 * Deletes all triggers from the project.
 */
function deleteAllTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
}

/**
 * Fetches the start dates, week numbers, message times, and messages from the "Setup" sheet.
 * The "Setup" sheet should have columns "Week", "Date", "Message Time", and "Message".
 * 
 * @returns {Array} An array of objects, each containing a week number, start date, message time, and message.
 */
function getWeekStartDatesWithTimes() {
    const sheetName = 'Setup';
    const range = encodeURIComponent(`${sheetName}!A2:D18`);
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
    const data = JSON.parse(response.getContentText()).values;

    return data.map(row => ({
        week: row[0],
        date: row[1],
        time: row[2],
    }));
}

/*
**
 * Fetches the messages for a specific week from the "Setup" sheet.
 * The "Setup" sheet should have columns "Week" and "Message".
 * 
 * @param {number} week - The week number for which to fetch the messages.
 * @returns {Array} An array of messages for the specified week.
 */
function getWeekMessages(week) {
    const sheetName = 'Setup';
    const range = encodeURIComponent(`${sheetName}!A22:B30`);
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
    const data = JSON.parse(response.getContentText()).values;

    return data
        .filter(row => row[0] == week)
        .map(row => row[1]);  // Return only the message from column B
}


/**
 * Creates a dictionary with dates as keys and week numbers as values.
 * The dates range from each week's start date to six days after.
 *
 * @param {Array} weekStartDates - An array of objects, each containing a week number and start date.
 * @returns {Object} A dictionary with dates as keys and week numbers as values.
 */
function createWeekDateDictionary(weekStartDates) {
    const weekDateDictionary = {};

    for (let i = 0; i < weekStartDates.length; i++) {
        const weekNumber = weekStartDates[i].week;
        const startDateStr = weekStartDates[i].date;

        if (!startDateStr) {
            Logger.log(`Invalid date string for week ${weekNumber}`);
            continue;
        }

        const startDate = new Date(startDateStr.split('/').reverse().join('-'));

        for (let j = 0; j < 7; j++) { // Include start date + next 6 days
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + j);

            const dateKey = [
                ('0' + currentDate.getDate()).slice(-2),
                ('0' + (currentDate.getMonth() + 1)).slice(-2),
                currentDate.getFullYear()
            ].join('/');

            weekDateDictionary[dateKey] = weekNumber;
        }
    }

    return weekDateDictionary;
}

/**
 * Fetches the start dates and week numbers from the "Setup" sheet.
 * The "Setup" sheet should have columns "Week" and "Date".
 * 
 * @returns {Array} An array of objects, each containing a week number and start date.
 */
function getWeekStartDates() {
    const sheetName = 'Setup';
    const range = encodeURIComponent(`${sheetName}!A3:B11`);
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
        Logger.log('No week date information found.');
        return [];
    }

    return values.map(row => ({
        week: parseInt(row[0]),
        date: row[1]
    }));
}

/**
 * Helper function to get the week number for a given date string.
 * If dateStr is not provided, assume dateStr is today's date.
 * 
 * @param {string} [dateStr] - The date string in the format "DD/MM/YYYY".
 * @returns {number|string} The week number or an error message with the valid date range if the date is invalid.
 */
function getWeek(dateStr = null) {
    if (!dateStr) {
        const currentDate = new Date();
        dateStr = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    }

    const weekStartDates = getWeekStartDates();
    const weekDateDictionary = createWeekDateDictionary(weekStartDates);

    if (!weekDateDictionary[dateStr]) {
        const validDateRange = weekStartDates.map(startDate => startDate.date).join(' to ');
        return `Error: Invalid date. The date ${dateStr} is outside the valid week start date limits. Valid date range: ${validDateRange}.`;
    }

    return weekDateDictionary[dateStr];
}
/**
 * Sends the current week's message to all existing citizens.
 */
function sendScheduledMessage() {
    const currentWeek = getWeek();
    const scheduledMessage = getWeekMessages(currentWeek);

    if (typeof currentWeek === 'string' && currentWeek.startsWith('Error')) {
        Logger.log(currentWeek);
        return;
    }

    const citizens = getAllCitizens();
    citizens.forEach(citizen => {
        console.log(`Sending: "${scheduledMessage}" to ${citizen.name} at ${citizen.spaceId}`);
        sendMessage(
            {
                "action_response": {
                    "type": "NEW_MESSAGE"
                },
                "cardsV2": [
                    {
                        "cardId": "reply-card-id",
                        "card": {
                            "header": {
                                "title": "McKinnonVille",
                                "subtitle": `Week ${currentWeek}`,
                                "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/plot/estate.png",
                                "imageType": "CIRCLE"
                            },
                            "sections": [
                                {
                                    "header": "",
                                    "collapsible": false,
                                    "uncollapsibleWidgetsCount": 1,
                                    "widgets": [
                                        {
                                            "decoratedText": {
                                                "icon": {
                                                    "iconUrl": "https://cdn-icons-png.flaticon.com/128/4457/4457168.png"
                                                },
                                                "text": "",
                                                "bottomLabel": "Weekly message"
                                            }
                                        },
                                        {
                                            "textParagraph": {
                                                "text": `${scheduledMessage}`
                                            }
                                        },
                                        {
                                            "decoratedText": {
                                                "icon": {
                                                    "iconUrl": "https://cdn-icons-png.flaticon.com/128/6778/6778935.png"
                                                },
                                                "bottomLabel": "Level up",
                                                "text": ""
                                            }
                                        },
                                        {
                                            "textParagraph": {
                                                "text": `Ready to level up? Click the button attempt a level up!`
                                            }
                                        },
                                        {
                                            "buttonList": {
                                                "buttons": [
                                                    {
                                                        "text": "Start level up quiz",
                                                        "onClick": {
                                                            "action": {
                                                                "interaction": "OPEN_DIALOG",
                                                                "function": "handleSendQuizDialog"
                                                            }
                                                        },
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "decoratedText": {
                                                "icon": {
                                                    "iconUrl": "https://cdn-icons-png.flaticon.com/128/927/927295.png"
                                                },
                                                "bottomLabel": "Ordinance vote",
                                                "text": ""
                                            }
                                        },
                                        {
                                            "textParagraph": {
                                                "text": "An ordinance vote is now open. Click the button to cast your vote!"
                                            }
                                        },
                                        {
                                            "buttonList": {
                                                "buttons": [
                                                    {
                                                        "text": "Click here to vote now",
                                                        "onClick": {
                                                            "action": {
                                                                "interaction": "OPEN_DIALOG",
                                                                "function": "handleSendVotingDialog"
                                                            }
                                                        },
                                                    }
                                                ]
                                            }
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
            , citizen.spaceId);

    });
}

/**
 * Sends a scheduled quiz to each citizen based on their occupation and occupation level.
 */
function sendScheduledQuiz() {
    const citizens = getAllCitizens();

    citizens.forEach(citizen => {
        const message = "Your quiz is now ready to be completed. Use the /quiz command to attempt a level up!";
        sendMessage(message, citizen.spaceId);
    });
}

/**
 * Sends a scheduled vote to all citizens.
 */
function sendScheduledVote() {
    const citizens = getAllCitizens();

    citizens.forEach(citizen => {
        const message = "An ordinance vote is now open. Use the /vote command to cast your vote!";
        sendMessage(message, citizen.spaceId);
    });
}