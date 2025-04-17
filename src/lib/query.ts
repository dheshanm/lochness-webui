/**
 * Removes all newline and tab characters from a formatted SQL query.
 *
 * @param formattedSQL - The formatted SQL query string.
 * @returns The unformatted SQL query string without newline and tab characters.
 */
export function unformatSQL(formattedSQL: string): string {
    if (typeof formattedSQL !== 'string') {
        throw new TypeError('Input must be a string.');
    }

    // Replace all newline (\n) and carriage return (\r) characters
    // Replace all tab (\t) characters
    // Optionally, you can also replace multiple spaces with a single space
    const unformatted = formattedSQL
        .replace(/[\n\r]/g, ' ')   // Replace newlines and carriage returns with space
        .replace(/\t/g, ' ')       // Replace tabs with space
        .replace(/ {2,}/g, ' ')    // Replace multiple spaces with a single space
        .trim();                    // Remove leading and trailing spaces

    return unformatted;
}
