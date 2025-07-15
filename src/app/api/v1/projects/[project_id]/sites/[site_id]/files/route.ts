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
        // Fetch files for the site, joining with data_pull for subject and data source info
        const query = `
            SELECT 
                f.file_path,
                f.file_md5,
                f.file_size_mb,
                f.file_m_time,
                dp.subject_id,
                dp.data_source_name
            FROM files f
            LEFT JOIN data_pull dp ON f.file_path = dp.file_path AND f.file_md5 = dp.file_md5
            WHERE dp.site_id = $1 AND dp.project_id = $2
            ORDER BY f.file_m_time DESC
        `;
        const values = [site_id, project_id];
        try {
            const { rows } = await connection.query(query, values);
            return NextResponse.json({ files: rows });
        } catch (dbError) {
            console.error('DB error fetching files:', dbError);
            return NextResponse.json({ error: 'Database error fetching files' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 