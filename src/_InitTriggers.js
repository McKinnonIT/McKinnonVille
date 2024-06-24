/**
 * Sets up an hourly trigger for the 'createScheduledMessageTriggers' function.
 * createScheduledMessageTriggers()
 *   Creates or updates triggers to execute the sendScheduledMessage function on specified dates and times.
 *   The dates and times are fetched from the "Setup" sheet, which should have columns "Week", "Date", "Message Time", and "Message".
 */
function setupHourlyTrigger() {
    const existingTriggers = ScriptApp.getProjectTriggers();
    const triggerExists = existingTriggers.some(trigger => trigger.getHandlerFunction() === 'createScheduledMessageTriggers');

    if (!triggerExists) {
        const trigger = ScriptApp.newTrigger('createScheduledMessageTriggers')
            .timeBased()
            .everyHours(1)
            .create();
        console.log(trigger)
    }
}
