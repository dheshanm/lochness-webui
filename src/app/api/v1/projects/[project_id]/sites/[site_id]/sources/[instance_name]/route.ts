import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { DataSources } from "@/lib/models/data-sources";
import { Logs } from "@/lib/models/logs";

export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string, instance_name: string }> }
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
    const site_id = params.site_id;
    const instance_name = params.instance_name;

    if (!project_id || !site_id || !instance_name) {
        return new Response(JSON.stringify({ error: "Missing project_id or site_id or instance_name" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const dataSources = await DataSources.getDataSourceById(project_id, site_id, instance_name);

    if (!dataSources) {
        return new Response(JSON.stringify({ error: "Data source not found" }), {
            status: 404,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    return new Response(JSON.stringify(dataSources), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string, instance_name: string }> }
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
    const site_id = params.site_id;
    const instance_name = params.instance_name;

    if (!project_id || !site_id || !instance_name) {
        return new Response(JSON.stringify({ error: "Missing project_id or site_id or instance_name" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const dataSources = await DataSources.deleteDataSource(project_id, site_id, instance_name);

    if (!dataSources) {
        await Logs.log(
            "WARNING",
            {
                method: "DELETE",
                route: `/api/v1/projects/${project_id}/sites/${site_id}/sources/${instance_name}`,
                message: "Data source not found",
                status_code: 404,
                project_id,
                site_id,
                data_source: instance_name,
                error: {
                    type: "DataSourceNotFound",
                    details: "The data source was not found in the database.",
                },
                user_email: session?.user?.email,
            }
        )
        return new Response(JSON.stringify({ error: "Data source not found" }), {
            status: 404,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await Logs.log(
        "INFO",
        {
            method: "DELETE",
            route: `/api/v1/projects/${project_id}/sites/${site_id}/sources/${instance_name}`,
            message: "Data source deleted successfully",
            status_code: 200,
            project_id,
            site_id,
            data_source: instance_name,
            user_email: session?.user?.email,
        }
    )
    return new Response(JSON.stringify(dataSources), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}