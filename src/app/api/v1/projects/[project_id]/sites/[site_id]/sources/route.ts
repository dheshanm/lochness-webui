import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { DataSources } from "@/lib/models/data-sources";
import { DataSource } from "@/types/data-sources";

import { Logs } from "@/lib/models/logs";

export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;

    if (!project_id || !site_id) {
        return new Response(JSON.stringify({ error: "Missing project_id or site_id parameter" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const dataSources = await DataSources.getSiteDataSources(project_id, site_id);

    return new Response(JSON.stringify(dataSources), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function POST(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string }> }
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

    if (!project_id || !site_id) {
        return new Response(JSON.stringify({ error: "Missing project_id or site_id parameter" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const dataSourceData = await request.json();

    if (!dataSourceData) {
        return new Response(JSON.stringify({ error: "Missing data source data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const supportedDataSourceTypes = await DataSources.getSupportedDataSourceTypes();
    const dataSourceType = dataSourceData.data_source_type;

    if (!supportedDataSourceTypes.includes(dataSourceType)) {
        return new Response(JSON.stringify({ error: "Unsupported data source type" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const dataSource: DataSource = {
        data_source_name: dataSourceData.data_source_name,
        data_source_is_active: dataSourceData.data_source_is_active,
        site_id: site_id,
        project_id: project_id,
        data_source_type: dataSourceType,
        data_source_metadata: dataSourceData.data_source_metadata,
    };

    const result = await DataSources.createOrUpdateDataSource(dataSource);

    if (!result) {
        await Logs.log("WARNING", {
            method: "POST",
            route: `/api/v1/projects/${project_id}/sites/${site_id}/sources`,
            message: "Failed to create or update data source",
            status_code: 500,
            project_id: project_id,
            site_id: site_id,
            data: dataSource,
            user_email: session?.user?.email,
            error: {
                type: "DataSourcePersistenceError",
                details: "The `DataSources.createOrUpdateDataSource` method returned a falsy value, indicating the data source could not be saved or updated.",
            }
        });
        return new Response(JSON.stringify({ error: "Failed to create or update data source" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await Logs.log("INFO", {
        method: "POST",
        route: `/api/v1/projects/${project_id}/sites/${site_id}/sources`,
        message: "Data source created or updated successfully",
        status_code: 201,
        project_id: project_id,
        site_id: site_id,
        data: dataSource,
        user_email: session?.user?.email,
    });
    return new Response(JSON.stringify(result), {
        status: 201,
        headers: {
            "Content-Type": "application/json",
        },
    });
}