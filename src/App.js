// Global configurations and property initializations for the McKinnonVille app.
// This script retrieves configuration from script properties and initializes various constants
// used throughout the application.

var scriptProperties = PropertiesService.getScriptProperties();

// Retrieve spreadsheet IDs for data and map storage
const SPREADSHEET_ID_DATA = scriptProperties.getProperty('SPREADSHEET_ID_DATA');
const SPREADSHEET_ID_MAP = scriptProperties.getProperty('SPREADSHEET_ID_MAP');

// Retrieve private key and client email for authentication with external services
const PRIVATE_KEY = scriptProperties.getProperty('PRIVATE_KEY').replace(/\\n/g, "\n");
const CLIENT_EMAIL = scriptProperties.getProperty('CLIENT_EMAIL');
const TOKEN_URI = scriptProperties.getProperty('TOKEN_URI');

// Define the scopes for which the app will request access
const SCOPES = scriptProperties.getProperty('SCOPES').split(',');

/**
 * Checks if a user is registered.
 *
 * @param {string} email - The email of the user to check.
 * @returns {boolean} - True if the user is registered, false otherwise.
 */
function isRegistered(email) {
  try {
    const citizen = new Citizen(email, false);
    return citizen.exists();
  } catch (error) {
    Logger.log('Error checking registration: ' + error.toString());
    return false; // Assume not registered if there's an error
  }
}

/**
 * Handles incoming messages and performs actions based on the message content.
 *
 * @param {Object} event - The event object containing the message details.
 */
function onMessage(event) {
  if (event.message.slashCommand) {
    if (event.space && event.space.type === 'DM') {

      // Array of commandId's that do not require registration.
      const doesNotRequireRegistration = [1];

      if (!doesNotRequireRegistration.includes(event.message.slashCommand.commandId) && !isRegistered(event.user.email)) {
        return sendMessage(
          "You are not registered to play McKinnonVille. You can sign up by using the /play command.", event.space.name, true, event.user.name)
      }

      switch (event.message.slashCommand.commandId) {
        case 1:
          return slashPlay(event);
        case 2:
          return slashStats(event);
        case 3:
          return slashQuiz(event);
        case 99:
          return slashTest(event);
      }
    } else {
      return sendMessage("Spaces are not supported. Try sending me a DM!", event.space.name, true, event.user.name)
    }
  }
}
