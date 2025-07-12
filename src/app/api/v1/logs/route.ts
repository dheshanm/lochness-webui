import { getConnection } from "@/lib/db";
import { unformatSQL } from "@/lib/query";

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
    const projectId = url.searchParams.get('project_id');
    const siteId = url.searchParams.get('site_id');

    let baseQuery = `
        SELECT 
            CONCAT(
                to_char(log_timestamp, 'YYYY-MM-DD HH24:MI:SS'),
                ' [', log_level, '] ',
                log_message::text
            ) AS extended_log_format
        FROM public.logs
    `;

    // Add filtering if project_id and/or site_id are provided
    const filters: string[] = [];
    if (projectId) {
        filters.push(`(
            (log_message ? 'project_id' AND log_message->>'project_id' = '${projectId}')
            OR log_message::text ILIKE '%${projectId}%'
        )`);
    }
    if (siteId) {
        filters.push(`(
            (log_message ? 'site_id' AND log_message->>'site_id' = '${siteId}')
            OR log_message::text ILIKE '%${siteId}%'
        )`);
    }
    if (filters.length > 0) {
        baseQuery += ` WHERE ${filters.join(' AND ')}`;
    }

    baseQuery += ` ORDER BY log_timestamp`;

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
        projectId,
        siteId,
    };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}