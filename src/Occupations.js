// Constants for the Google Sheets range and sheet name that stores occupation data.
const OCCUPATIONS_SHEET_NAME = 'Setup';
const OCCUPATIONS_RANGE = 'A14:B26';

/**
 * Fetches and returns a sorted list of occupations from a Google Sheet.
 * Each occupation is expected to have an icon and a name.
 *
 * @returns {Array} An array of occupation objects, sorted alphabetically by name.
 */
function getOccupations() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(OCCUPATIONS_SHEET_NAME + "!" + OCCUPATIONS_RANGE)}`;
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
    const values = JSON.parse(response.getContentText()).values;

    if (values && values.length > 0) {
        // Since we expect each row to have two elements (icon and name), we keep the rows as arrays
        const occupations = values.map(row => ({
            icon: row[0],
            name: row[1]
        }));
        // Sort occupations alphabetically by name
        const sortedOccupations = occupations.sort((a, b) => a.name.localeCompare(b.name));
        return sortedOccupations;
    } else {
        Logger.log('No data found.');
        return [];
    }
}

/**
 * Converts an array of occupation objects into items for a selectionInput.
 * 
 * @param {Array} occupations - An array of occupation objects.
 * @returns {Array} An array of items formatted for display in a selectionInput.
 */
function getOccupationItems(occupations) {
    // Map the occupations to the items format expected by the selectionInput
    const occupationItems = occupations.map(occupation => ({
        text: `${occupation.icon} ${occupation.name}`,
        value: occupation.name,
        selected: false,
    }));
    return occupationItems;
}

/**
 * Generates a dialog for user to select an occupation using a dropdown menu in Google Chat.
 * 
 * @returns {object} An object formatted for triggering a dialog in Google Chat with a selectionInput.
 */
function selectOccupationDialog() {
    const occupations = getOccupations();

    if (!occupations) {
        return {
            text: 'Failed to retrieve occupations. Please email help@mckinnonsc.vic.edu.au.',
        };
    }

    // Map the occupations to the items format expected by the selectionInput
    const occupationItems = getOccupationItems(occupations)
    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        sections: [
                            {
                                header: 'Select your occupation',
                                widgets: [
                                    {
                                        textParagraph: {
                                            "text": "You now need to select an occupation. This will determine your role in the McKinnonVille."
                                        },
                                    }, {
                                        selectionInput: {
                                            type: 'DROPDOWN',
                                            label: 'Occupations',
                                            name: 'occupations',
                                            items: occupationItems,
                                            onChangeAction: {
                                                function: 'handleOccupationSelection',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    }
                }
            }
        }
    }
}
