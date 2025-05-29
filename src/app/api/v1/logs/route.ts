import { getConnection } from "@/lib/db";
import { unformatSQL } from "@/lib/query";

import { Logs } from "@/lib/models/logs";

/**
 * Handles the GET request to fetch Logs from the database.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched Logs in JSON format.
 *
 */
export async function GET(request: Request): Promise<Response> {
    const connection = getConnection();
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 100;
    const offset = url.searchParams.get('offset') || 0;

    const baseQuery = `
        SELECT 
            CONCAT(
                to_char(log_timestamp, 'YYYY-MM-DD HH24:MI:SS'),
                ' [', log_level, '] ',
                log_message::text
            ) AS extended_log_format
        FROM public.logs
        ORDER BY log_timestamp
    `;

    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS total_count`;
    const countResult = await connection.query(countQuery);
    const totalRows = countResult.rows[0].count;

    const limitedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    const { rows } = await connection.query(limitedQuery);

    const metadata = {
        query: unformatSQL(limitedQuery),
        totalRows,
        limit,
        offset,
    };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}


export async function POST(request: Request): Promise<Response> {
    const { log_level, log_message } = await request.json();

    if (!log_level || !log_message) {
        return new Response(JSON.stringify({ error: "Missing log_level or log_message" }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        // Add provenance to the log message
        const provenance = {
            source: "lochness-webui:api",
        };
        const logMessageWithProvenance = {
            ...log_message,
            provenance,
        };

        await Logs.log(log_level, logMessageWithProvenance);
        return new Response(JSON.stringify({ message: "Log entry created successfully" }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error inserting log entry:", error);
        return new Response(JSON.stringify({ error: "Failed to create log entry" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}