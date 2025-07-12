import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DataSources } from "@/lib/models/data-sources";
import { DataSource } from "@/types/data-sources";

export async function POST(request: NextRequest, { params }: { params: { project_id: string } }) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = params;
        const body = await request.json();
        const { site_ids, data_source_type, data_source_metadata } = body;
        
        if (!project_id || !site_ids || !Array.isArray(site_ids) || !data_source_metadata || !data_source_type) {
            return NextResponse.json({ error: 'Missing required fields: site_ids, data_source_type, data_source_metadata' }, { status: 400 });
        }

        // Validate data source type
        const supportedDataSourceTypes = await DataSources.getSupportedDataSourceTypes();
        if (!supportedDataSourceTypes.includes(data_source_type)) {
            return NextResponse.json({ error: 'Unsupported data source type' }, { status: 400 });
        }

        const success: string[] = [];
        const failed: string[] = [];

        // Create data source for each site
        for (const site_id of site_ids) {
            try {
                // Generate a unique data source name based on type and site
                const data_source_name = `${data_source_type}_${site_id}_${Date.now()}`;
                
                const dataSource: DataSource = {
                    data_source_name,
                    data_source_is_active: true,
                    site_id,
                    project_id,
                    data_source_type,
                    data_source_metadata,
                };

                const result = await DataSources.createOrUpdateDataSource(dataSource);
                
                if (result && result.updatedRowCount > 0) {
                    success.push(site_id);
                } else {
                    failed.push(site_id);
                }
            } catch (error) {
                console.error(`Failed to create data source for site ${site_id}:`, error);
                failed.push(site_id);
            }
        }

        return NextResponse.json({ success, failed });
    } catch (error) {
        console.error('Error in batch add data sources:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 