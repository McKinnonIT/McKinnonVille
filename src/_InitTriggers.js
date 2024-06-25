/**
 * Sets up hourly triggers for the specified function names.
 * 
 * @param {Array} functionNames - An array of function names to set up hourly triggers for.
 */
function initHourlyTriggers(functionNames) {
    const existingTriggers = ScriptApp.getProjectTriggers();

    functionNames.forEach(functionName => {
        const triggerExists = existingTriggers.some(trigger => trigger.getHandlerFunction() === functionName);

        if (!triggerExists) {
            const trigger = ScriptApp.newTrigger(functionName)
                .timeBased()
                .everyHours(1)
                .create();
            console.log(`Created trigger for ${functionName}:`, trigger);
        }
    });
}

const functionNames = ['createScheduledMessageTriggers', 'createScheduledQuizTriggers'];
initHourlyTriggers(functionNames);
