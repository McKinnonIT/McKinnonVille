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

