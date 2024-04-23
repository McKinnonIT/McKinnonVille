## Disclaimer

This README and the associated project documentation were generated with the assistance of ChatGPT. While efforts have been made to ensure accuracy, the content may contain inaccuracies or outdated information. Please verify all steps and information directly within the Google Apps Script and associated Google Cloud services.

## McKinnonVille

McKinnonVille is a Google Apps Script project designed to facilitate interactive engagement within Google Chat. It enables users to participate in various activities such as playing games, signing up for events, or receiving personalized content through slash commands and interactive cards.
## Table of Contents

- [Disclaimer](#disclaimer)
- [McKinnonVille](#mckinnonville)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Development](#development)
  - [Local Development Setup for Google Apps Script](#local-development-setup-for-google-apps-script)
    - [Prerequisites](#prerequisites)
    - [Steps to Set Up Local Development](#steps-to-set-up-local-development)
    - [Automating `clasp push` with Git Push](#automating-clasp-push-with-git-push)


## Features

- **Slash Commands**: Users can interact with the bot via slash commands to perform specific actions.
- **Direct Messages (DM)**: Supports receiving commands through direct messages to offer a personalized interaction.
- **Interactive Cards**: Provides users with interactive cards for various purposes, such as signing up for events, selecting preferences, and answering quizzes.
- **Google Sheets Integration**: Utilizes Google Sheets for data storage, including managing user participation and tracking available plots or selections.

## Setup

1. **Google Cloud Project**: Set up a Google Cloud Project and enable the Google Chat API and Google Sheets API.
2. **Script Deployment**: Deploy the script as a Google Workspace Add-on or as a web app.
3. **Bot Configuration**: Configure the bot in Google Chat with the necessary permissions and settings.
4. **Spreadsheet Setup**: Create a Google Spreadsheet with the required structure for tracking data.

## Environment Variables

The application uses the following environment variables:

- `SPREADSHEET_ID_DATA`: The ID of the Google Spreadsheet used for data storage.
- `SPREADSHEET_ID_MAP`: The ID of the public Google Spreadsheet used for map & plot storage.
- `PRIVATE_KEY`: The private key used for authentication with external services.
- `CLIENT_EMAIL`: The client email used for authentication with external services.
- `TOKEN_URI`: The URI used for retrieving authentication tokens.
- `SCOPES`: The scopes for which the app will request access, as a comma-separated string.

These variables are stored as script properties in Google Apps Script and can be accessed using `PropertiesService.getScriptProperties().getProperty('VARIABLE_NAME')`.

## Usage

- `/play` - Opens a signup form for users to join McKinnonVille
- `/stats` - Displays statistics for the user, including their progress and achievements in the game.
- `/quiz` - Starts a quiz session, challenging users with questions related to their McKinnonVille career.

## Development

This project is developed using Google Apps Script (JavaScript). To contribute or customize:

1. Open the Google Apps Script editor.
2. Paste the provided script.
3. Modify the script according to your needs.
4. Deploy the changes following the Google Apps Script deployment process.

### Local Development Setup for Google Apps Script

Developing Google Apps Script projects locally can enhance productivity, especially when using powerful IDEs like Visual Studio Code. Here's how you can set up your project for local development:

#### Prerequisites

1. **Google Account**: Needed to access Google Apps Script and Google Cloud Platform.
2. **Node.js**: Ensure Node.js is installed on your development machine.
3. **Visual Studio Code**: Or any preferred code editor.
4. **Clasp**: A command-line tool to develop and manage Apps Script projects.

#### Steps to Set Up Local Development

1. **Install Clasp**: Run `npm install -g @google/clasp` in your terminal to install Clasp globally.

2. **Login to Clasp**: Execute `clasp login` to authenticate Clasp with your Google account.

3. **Create or Clone an Apps Script Project**:
     - To **create** a new project, run `clasp create --title "McKinnonVille" --type standalone` in your desired local directory.
     - Create a new directory within the project directory titled `src`
     - Clone the existing McKinnonVille Apps Script project `clasp clone "PROJECT_ID_HERE" --rootDir src`

4. **Push Changes**: Run `clasp push -P src` to upload local changes to the Google Apps Script project online.

5. **Pull Changes**: If the script is edited online, synchronize with your local version using `clasp pull`.

#### Automating `clasp push` with Git Push

To streamline the development workflow, you can automate the `clasp push -P src` command to run every time you execute `git push`. This ensures that your Google Apps Script project is always up-to-date with your local changes. Follow these steps to set up a Git pre-push hook:

1. Navigate to the `.git/hooks` directory in your project folder.
2. Create a file named `pre-push` if it doesn't already exist (no file extension).
3. Make the `pre-push` file executable: On Linux or macOS, run `chmod +x .git/hooks/pre-push`.
4. Edit the `pre-push` file to include the following script:

```bash
#!/bin/sh
cd "$(git rev-parse --show-toplevel)"
clasp push -P src
if [ $? -eq 0 ]; then
    echo "clasp push succeeded, proceeding with git push."
else
    echo "clasp push failed, aborting git push."
    exit 1
fi
```