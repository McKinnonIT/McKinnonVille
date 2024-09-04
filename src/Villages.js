class Village {
    constructor(villageName, stats) {
        this.villageName = villageName;
        this.setStats(stats);
    }

    setStats(stats) {
        this.population = stats[0]; // Column B
        this.gold = stats[1];       // Column C
        this.education = stats[2];  // Column D
        this.health = stats[3];     // Column E
        this.happiness = stats[4];  // Column F
        this.penaltyFactor = stats[5]; // Column G
        this.penalty = stats[6];       // Column H
        this.rawProsperity = stats[7]; // Column I
        this.prosperity = stats[8];    // Column J
    }

    static getVillageStats(villageNames) {
        const sheetName = 'Villages';
        const range = 'A3:J'; // Adjust the range to include all relevant columns
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_DATA}/values/${encodeURIComponent(sheetName + '!' + range)}`;
        const headers = {
            'Authorization': 'Bearer ' + getServiceAccountToken(),
            'Content-Type': 'application/json',
        };
        const options = { method: 'get', headers: headers, muteHttpExceptions: true };
        const response = UrlFetchApp.fetch(url, options);
        const values = JSON.parse(response.getContentText()).values || [];

        // Normalize villageNames to an array, even if it's a single string
        if (!Array.isArray(villageNames)) {
            villageNames = [villageNames];
        }

        // Create an object to store stats by village name
        const villagesStats = {};
        values.forEach(row => {
            const villageName = row[0];
            if (villageNames.includes(villageName)) {
                villagesStats[villageName] = row.slice(1); // Store stats excluding the name
            }
        });

        // If only one village name was provided, return a single Village instance
        if (villageNames.length === 1) {
            const name = villageNames[0];
            if (villagesStats[name]) {
                return new Village(name, villagesStats[name]);
            } else {
                throw new Error(`Village '${name}' not found`);
            }
        }

        // For multiple village names, return an array of Village instances
        return villageNames.map(name => {
            if (villagesStats[name]) {
                return new Village(name, villagesStats[name]);
            } else {
                throw new Error(`Village '${name}' not found`);
            }
        });
    }
}

