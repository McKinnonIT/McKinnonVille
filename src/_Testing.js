function testTesting() {

    // Example usage for single village:
    try {
        const flynn = Village.getVillageStats("Flynn");
        Logger.log(flynn.population);
        Logger.log(flynn.gold);
    } catch (e) {
        Logger.log(e.message);
    }

    // Example usage for multiple villages:
    try {
        const [flynn, monash, chisholm] = Village.getVillageStats(["Flynn", "Monash", "Chisholm"]);
        Logger.log(flynn.population);
        Logger.log(monash.gold);
        Logger.log(chisholm.education);
    } catch (e) {
        Logger.log(e.message);
    }

    // const week = getWeek();
    //sendScheduledMessage(week);
}