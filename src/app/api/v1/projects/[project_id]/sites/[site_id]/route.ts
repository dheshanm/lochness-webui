import { Sites } from "@/lib/models/sites";

/**
 * Handles the GET request to fetch sites for a given project and site ID.
 * 
 * @param {Request} request - The incoming request object.
 * @param {Promise<{ project_id: string, site_id: string }>} props - The project ID and site ID parameters.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched site in JSON format.
 * 
 */
export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string, site_id: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;

    if (!project_id || !site_id) {
        return new Response(JSON.stringify({ error: 'Missing project_id or site_id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const site = await Sites.getSiteById(project_id, site_id);

    if (!site) {
        return new Response(JSON.stringify({ error: 'Site not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(site), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
