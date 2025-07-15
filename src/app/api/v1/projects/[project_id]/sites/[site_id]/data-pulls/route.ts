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
        // Fetch data pulls for the site with subject and data source info
        const query = `
            SELECT 
                data_pull_id,
                subject_id,
                data_source_name,
                site_id,
                project_id,
                file_path,
                file_md5,
                pull_time_s,
                pull_timestamp,
                pull_metadata
            FROM data_pull
            WHERE site_id = $1 AND project_id = $2
            ORDER BY pull_timestamp DESC
        `;
        const values = [site_id, project_id];
        try {
            const { rows } = await connection.query(query, values);
            return NextResponse.json({ data_pulls: rows });
        } catch (dbError) {
            console.error('DB error fetching data pulls:', dbError);
            return NextResponse.json({ error: 'Database error fetching data pulls' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error fetching data pulls:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 