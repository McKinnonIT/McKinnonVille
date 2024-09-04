/**
 * Converts a given column number to its corresponding Excel-style column letter (e.g., 1 -> 'A', 27 -> 'AA').
 * This function uses a modulo operation to handle the conversion, iterating until the entire column number is processed.
 *
 * @param {number} column - The column number to be converted.
 * @returns {string} The corresponding column letter.
 */
function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function generateOccupationStatsString(education, health, happiness, salaryLow, salaryHigh) {
    // Function to generate the bar for a given factor
    function generateBar(factor) {
        let filledBlocks = Math.round(factor * 5); // Each block represents 0.2
        let emptyBlocks = 5 - filledBlocks;
        return '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
    }

    // Function to format the salary value
    function formatSalary(salary) {
        if (salary >= 1000) {
            return (salary / 1000) + "k";
        }
        return salary.toString();
    }

    // Generate bars for each factor
    let educationBar = generateBar(education);
    let healthBar = generateBar(health);
    let happinessBar = generateBar(happiness);

    // Format the salary range
    let formattedSalaryLow = formatSalary(salaryLow);
    let formattedSalaryHigh = formatSalary(salaryHigh);

    // Construct the final string
    let statsString = "📚  " + educationBar + "\n" +
        "🚑  " + healthBar + "\n" +
        "😀  " + happinessBar + "\n" +
        "💰 $" + formattedSalaryLow + " - $" + formattedSalaryHigh;

    return statsString;
}

function generateVillageBalance(education, health, happiness) {
    // Function to generate the bar for a given factor
    function generateBar(factor) {
        let filledBlocks = Math.round(factor); // Round to the nearest integer
        let emptyBlocks = 10 - filledBlocks;
        return '🟩'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
    }

    // Generate bars for each factor and return them as an object
    return {
        education: generateBar(education),
        health: generateBar(health),
        happiness: generateBar(happiness)
    };
}
