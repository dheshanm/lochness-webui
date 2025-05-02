import { DataSources } from "@/lib/models/data-sources";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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