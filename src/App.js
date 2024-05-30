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