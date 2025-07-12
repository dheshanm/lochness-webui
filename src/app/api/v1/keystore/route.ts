import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const project_id = searchParams.get('project_id');

        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const connection = getConnection();
        // Fetch keystore entries for the project (excluding encrypted key_value)
        const query = `
            SELECT key_name, key_type, project_id, key_metadata
            FROM key_store 
            WHERE project_id = $1
            ORDER BY key_name
        `;
        const values = [project_id];
        
        try {
            const { rows } = await connection.query(query, values);
            const entries = rows.map((row: any) => ({
                keystore_name: row.key_name,
                key_type: row.key_type,
                project_id: row.project_id,
                key_metadata: row.key_metadata,
            }));
            return NextResponse.json({ entries });
        } catch (dbError) {
            console.error('DB error fetching keystore entries:', dbError);
            return NextResponse.json({ error: 'Database error fetching keystore entries' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error fetching keystore entries:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { keystore_name, key_value, key_type, project_id, key_metadata } = body;

        // Validate required fields
        if (!keystore_name || !key_value || !key_type || !project_id) {
            return NextResponse.json({ 
                error: 'Missing required fields: keystore_name, key_value, key_type, project_id' 
            }, { status: 400 });
        }

        // Get encryption passphrase from env
        const passphrase = process.env.KEYSTORE_PASSPHRASE;
        if (!passphrase) {
            return NextResponse.json({ error: 'Encryption passphrase not set in environment (KEYSTORE_PASSPHRASE)' }, { status: 500 });
        }

        const connection = getConnection();
        // Insert or update keystore entry with encrypted value
        const query = `
            INSERT INTO key_store (
                key_name, project_id, key_value, key_type, key_metadata
            ) VALUES (
                $1, $2, pgp_sym_encrypt($3, $4), $5, $6
            ) ON CONFLICT (key_name, project_id)
            DO UPDATE SET key_value = EXCLUDED.key_value, key_type = EXCLUDED.key_type, key_metadata = EXCLUDED.key_metadata;
        `;
        const values = [
            keystore_name,
            project_id,
            key_value,
            passphrase,
            key_type,
            key_metadata ? JSON.stringify(key_metadata) : null,
        ];
        try {
            await connection.query(query, values);
        } catch (dbError) {
            console.error('DB error creating keystore entry:', dbError);
            return NextResponse.json({ error: 'Database error creating keystore entry' }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Keystore entry created successfully',
            keystore_name 
        });
    } catch (error) {
        console.error('Error creating keystore entry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 