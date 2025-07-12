import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DataSinks } from "@/lib/models/data-sinks";
import { DataSink } from "@/types/data-sinks";

export async function POST(request: NextRequest, { params }: { params: { project_id: string } }) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = params;
        const body = await request.json();
        const { site_ids, data_sink_metadata } = body;
        
        if (!project_id || !site_ids || !Array.isArray(site_ids) || !data_sink_metadata) {
            return NextResponse.json({ error: 'Missing required fields: site_ids, data_sink_metadata' }, { status: 400 });
        }

        const success: string[] = [];
        const failed: string[] = [];

        // Create data sink for each site
        for (const site_id of site_ids) {
            try {
                // Generate a unique data sink name based on site
                const data_sink_name = `sink_${site_id}_${Date.now()}`;
                
                const dataSink: DataSink = {
                    data_sink_name,
                    site_id,
                    project_id,
                    data_sink_metadata,
                };

                const result = await DataSinks.createOrUpdateDataSink(dataSink);
                
                if (result && result.updatedRowCount > 0) {
                    success.push(site_id);
                } else {
                    failed.push(site_id);
                }
            } catch (error) {
                console.error(`Failed to create data sink for site ${site_id}:`, error);
                failed.push(site_id);
            }
        }

        return NextResponse.json({ success, failed });
    } catch (error) {
        console.error('Error in batch add data sinks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 