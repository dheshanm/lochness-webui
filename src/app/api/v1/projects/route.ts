import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { Project } from "@/types/projects";
import { Projects } from "@/lib/models/projects";
import { Logs } from "@/lib/models/logs";

/**
 * Handles the GET request to fetch Projects from the database.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched Projects in JSON format.
 *
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 100;
    const offset = url.searchParams.get('offset') || 0;

    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    const results = await Projects.getAllProjects(
        parsedLimit,
        parsedOffset
    );

    const metadata = {
        query: `SELECT * FROM projects ORDER BY project_id LIMIT ${limit} OFFSET ${offset}`,
        totalRows: await Projects.getProjectsCount(),
        limit: parsedLimit,
        offset: parsedOffset,
    };

    return new Response(JSON.stringify({ metadata, rows: results }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}


/**
 * Handles the POST request to create a new project in the database.
 * 
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object indicating the success or failure of the operation.
 * 
 */
export async function POST(request: Request): Promise<Response> {
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

    const body = await request.json();
    const { project_id, project_name, project_is_active, project_metadata } = body;
    
    const newProject: Project = {
        project_id,
        project_name,
        project_is_active,
        project_metadata,
    };

    const result = await Projects.createOrUpdateProject(newProject);

    if (result.updatedRowCount !== 1) {
        await Logs.log(
            "WARNING",
            {
                method: "POST",
                route: `/api/v1/projects`,
                message: "Failed to create or update project",
                status_code: 500,
                project_id,
                data: newProject,
                error: {
                    type: "ProjectCreationOrUpdationFailed",
                    details: "The `Projects.createOrUpdateProject` method returned a non-1 updatedRowCount, indicating the project could not be saved or updated.",
                },
                user_email: session?.user?.email,
            }
        )
        return new Response(
            JSON.stringify({
                message: "Failed to create or update project",
                error: result.query,
            }),
            { status: 500 }
        );
    }

    await Logs.log(
        "INFO",
        {
            method: "POST",
            route: `/api/v1/projects`,
            message: "Project created or updated successfully",
            status_code: 201,
            project_id,
            data: newProject,
            user_email: session?.user?.email,
        }
    );
    return new Response(
        JSON.stringify({
            message: "Project created or updated successfully",
            project: newProject,
        }),
        { status: 201 }
    );
}
