import { Logs } from "@/lib/models/logs";

/**
 * Handles the GET request to fetch Logs from the database.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched Logs in JSON format.
 *
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 100;
    const offset = url.searchParams.get('offset') || 0;

    const data = await Logs.getAllLogs(parseInt(limit as string), parseInt(offset as string));

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}