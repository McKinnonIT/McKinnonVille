/**
 * Sends a message to a Google Chat space, with an option to send it as a private message to a specific user.
 * The function constructs a message payload and makes an HTTP POST request to the Google Chat API.
 * 
 * @param {string|object} message - The text content of the message to be sent, or an object representing a card.
 * @param {string} spaceId - The identifier of the Google Chat space where the message will be sent.
 * @param {boolean} [sendPrivately=false] - Optional. If set to true, the message will be sent as a private message.
 * @param {string} [userId=''] - Optional. The user identifier; required if sendPrivately is true to specify the recipient.
 * 
 * @example
 * // Send a public text message to a space
 * sendMessage("Hello, world!", "spaces/AAAABdHzBzg");
 * 
 * // Send a private text message to a user within a space
 * sendMessage("Hello, privately!", "spaces/AAAABdHzBzg", true, "users/12345678901234567890");
 * 
 * // Send a card message to a space
 * sendMessage({ "cards": [{ "header": { "title": "Card Title" }, "sections": [{ "widgets": [{ "textParagraph": { "text": "Card content" } }] }] }] }, "spaces/AAAABdHzBzg");
 * 
 * Note: If sendPrivately is true and userId is not provided, the function will not modify the behavior
 * and the message will be sent publicly to the space.
 */
function sendMessage(message, spaceId, sendPrivately = false, userId = '') {
    const url = `https://chat.googleapis.com/v1/${spaceId}/messages`;
    const headers = {
        'Authorization': 'Bearer ' + getServiceAccountToken(),
        'Content-Type': 'application/json',
    };

    // Construct the basic payload
    let payloadObj = typeof message === 'string' ? { text: message } : message;

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
    } catch (e) {
        Logger.log("Error sending message to Google Chat: " + e.toString());
    }
}
