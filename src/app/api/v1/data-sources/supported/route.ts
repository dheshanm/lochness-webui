import getConfig from 'next/config';
import { DataSources } from "@/lib/models/data-sources";

export async function GET(): Promise<Response> {
    const { publicRuntimeConfig } = getConfig();

    const webUiVersion = publicRuntimeConfig.version;

    const supportedDataSourceTypes = await DataSources.getSupportedDataSourceTypes();

    const response = {
        webUiVersion: webUiVersion,
        supportedDataSourceTypes: supportedDataSourceTypes,
    };
    
    return new Response(JSON.stringify(response), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
