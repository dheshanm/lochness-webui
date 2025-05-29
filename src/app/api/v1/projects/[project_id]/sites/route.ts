import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { Site } from "@/types/sites";
import { Sites } from "@/lib/models/sites";
import { Logs } from "@/lib/models/logs";

/**
 * Handles the GET request to fetch all sites for a given project from the database.
 * 
 * @param {Request} request - The incoming request object.
 * @param {Promise<{ project_id: string }>} props - The project ID parameter.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched sites in JSON format.
 * 
 */
export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;

    if (!project_id) {
        return new Response(JSON.stringify({ error: 'Missing project_id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const sites = await Sites.getProjectSites(project_id);

    if (!sites) {
        return new Response(JSON.stringify({ error: 'Sites not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(sites), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Handles the POST request to create a new site for a given project in the database.
 * 
 * @param {Request} request - The incoming request object.
 * @param {Promise<{ project_id: string }>} props - The project ID parameter.
 * @returns {Promise<Response>} - A promise that resolves to a Response object indicating the success or failure of the operation.
 * 
 */
export async function POST(
    request: Request,
    props: { params: Promise<{ project_id: string }> }
): Promise<Response> {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
        headers: requestHeaders
    })

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const params = await props.params;
    const project_id = params.project_id;

    if (!project_id) {
        return new Response(JSON.stringify({ error: 'Missing project_id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const body = await request.json();
    const { site_id, site_name, site_is_active, site_metadata } = body;

    const newSite: Site = {
        site_id,
        project_id,
        site_name,
        site_is_active,
        site_metadata,
    };

    const result = await Sites.createOrUpdateSite(newSite);

    if (result.updatedRowCount !== 1) {
        await Logs.log(
            "WARNING",
            {
                method: "POST",
                route: `/api/v1/projects/${project_id}/sites`,
                message: "Failed to create or update site",
                staus_code: 500,
                project_id: project_id,
                site_id: site_id,
                data: newSite,
                error: {
                    type: "SiteDataPersistenceError",
                    details: "The `Sites.createOrUpdateSite` method did not return the expected row count.",
                }
            });
        return new Response(
            JSON.stringify({ error: 'Failed to create or update site' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    await Logs.log(
        "INFO",
        {
            method: "POST",
            route: `/api/v1/projects/${project_id}/sites`,
            message: "Site created or updated successfully",
            status_code: 201,
            project_id: project_id,
            site_id: site_id,
            data: newSite,
        }
    );
    return new Response(JSON.stringify(newSite), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}