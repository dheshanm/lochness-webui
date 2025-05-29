import { getConnection } from "@/lib/db";

import { Log, LogLevel } from "@/types/logs";

/**
 * Represents a collection of log-related operations.
 * This class provides static methods to interact with the logs table in the database,
 * allowing for fetching existing logs and creating new log entries.
 */
/**
 * A class for managing log entries in the database.
 */
export class Logs {
    /**
     * Retrieves a paginated list of log entries from the database.
     *
     * @param limit - The maximum number of log entries to retrieve. Defaults to 100.
     * @param offset - The number of log entries to skip before starting to retrieve. Defaults to 0.
     * @returns A promise that resolves to an array of Log objects.
     */
    static async getAllLogs(limit: number = 100, offset: number = 0): Promise<Log[]> {
        const connection = getConnection();
        const query = `SELECT * FROM public.logs ORDER BY log_timestamp LIMIT $1 OFFSET $2`;
        const values = [limit, offset];
        const { rows } = await connection.query(query, values);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logs: Log[] = rows.map((row: any) => ({
            log_level: row.log_level,
            log_message: row.log_message,
            log_timestamp: new Date(row.log_timestamp),
        }));

        return logs;
    }

    /**
     * Inserts a new log entry into the database.
     *
     * @param log_level - The severity level of the log entry (e.g., INFO, ERROR, WARN).
     * @param log_message - The content of the log entry, represented as a JSON object.
     * @returns A promise that resolves when the log entry has been successfully inserted.
     */
    static async log(
        log_level: LogLevel,
        log_message: Record<string, unknown>,
    ): Promise<void> {
        const connection = getConnection();
        const query = `INSERT INTO public.logs (log_level, log_message) VALUES ($1, $2)`;
        const values = [log_level, JSON.stringify(log_message)];
        await connection.query(query, values);
    }
}
