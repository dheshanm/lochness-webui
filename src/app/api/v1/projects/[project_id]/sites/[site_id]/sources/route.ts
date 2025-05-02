import { DataSources } from "@/lib/models/data-sources";
import { DataSource } from "@/types/data-sources";

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
        return new Response(JSON.stringify({ error: "Failed to create or update data source" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    return new Response(JSON.stringify(result), {
        status: 201,
        headers: {
            "Content-Type": "application/json",
        },
    });
}