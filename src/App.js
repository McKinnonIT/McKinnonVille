var scriptProperties = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
const PRIVATE_KEY = scriptProperties.getProperty('PRIVATE_KEY').replace(/\\n/g, "\n")
const CLIENT_EMAIL = scriptProperties.getProperty('CLIENT_EMAIL');
const TOKEN_URI = scriptProperties.getProperty('TOKEN_URI');
const SCOPES = scriptProperties.getProperty('SCOPES').split(',')
const DEV_USERS = scriptProperties.getProperty('DEV_USERS').split(',')

function onMessage(event) {
  if (event.message.slashCommand) {
    if (event.space && event.space.type === 'DM') {
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
