import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { project_id: string; site_id: string } }
) {
    const { project_id, site_id } = await params;
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const connection = getConnection();
        
        // Fetch data pushes for the site with joined data sink, subject, and data source information
        const query = `
            SELECT 
                dp.data_push_id,
                dp.data_sink_id,
                dp.file_path,
                dp.file_md5,
                dp.push_time_s,
                dp.push_timestamp,
                dp.push_metadata,
                ds.data_sink_name,
                ds.data_sink_metadata,
                dpull.subject_id,
                dpull.data_source_name
            FROM data_push dp
            LEFT JOIN data_sinks ds ON dp.data_sink_id = ds.data_sink_id
            LEFT JOIN data_pull dpull ON dp.file_path = dpull.file_path AND dp.file_md5 = dpull.file_md5
            WHERE ds.site_id = $1 AND ds.project_id = $2
            ORDER BY dp.push_timestamp DESC
        `;
        
        const values = [site_id, project_id];
        
        try {
            const { rows } = await connection.query(query, values);
            return NextResponse.json({ data_pushes: rows });
        } catch (dbError) {
            console.error('DB error fetching data pushes:', dbError);
            return NextResponse.json({ error: 'Database error fetching data pushes' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error fetching data pushes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 