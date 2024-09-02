function testTesting() {
    const week = getWeek();
    //sendScheduledMessage(week);

    const vote = getCitizenVote("sam.neal@mckinnonsc.vic.edu.au", week);
    Logger.log(vote)

    // const citizens = getAllCitizens();
    // citizens.forEach(c => {
    //     for (let i = 1; i <= 9; i++) {
    //         const attempts = getQuizAttempts(c.email, i)
    //         Logger.log(`${c.email}'s Week ${i} attempts: ${i}`)

    //     }
    // })

}
