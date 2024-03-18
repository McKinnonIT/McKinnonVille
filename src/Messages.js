function sendMessage(message, spaceId, sendPrivately = false, userId = '') {
    const url = `https://chat.googleapis.com/v1/${spaceId}/messages`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    // Construct the basic payload
    let payloadObj = {
        text: message,
    };

    // If sending privately, include the privateMessageViewer field with the user ID
    if (sendPrivately && userId) {
        payloadObj.privateMessageViewer = {
            name: `${userId}`
        };
    }

    // Convert the payload object to a JSON string
    const payload = JSON.stringify(payloadObj);

    const options = {
        method: 'post',
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        Logger.log(response.getContentText());
    } catch (e) {
        Logger.log("Error sending message to Google Chat: " + e.toString());
    }
}
