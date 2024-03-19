var scriptProperties = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
const PRIVATE_KEY = scriptProperties.getProperty('PRIVATE_KEY').replace(/\\n/g, "\n")
const CLIENT_EMAIL = scriptProperties.getProperty('CLIENT_EMAIL');
const TOKEN_URI = scriptProperties.getProperty('TOKEN_URI');
const SCOPES = scriptProperties.getProperty('SCOPES').split(',')

function onMessage(event) {
  if (event.message.slashCommand) {
    if (event.space && event.space.type === 'DM') {
      switch (event.message.slashCommand.commandId) {
        case 1:
          return slashPlay(event);
        // return openSignupForm(event);
        case 99:
          return slashTest(event);
      }
    } else {
      return sendMessage("Spaces are not supported. Try sending me a DM!", event.space.name, true, event.user.name)
    }
  }
}
