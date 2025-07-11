import { getConnection } from "@/lib/db";
import { DBUpdateResult } from "@/types/dbUpdateResult";
import { DataSink } from "@/types/data-sinks";

export class DataSinks {
    static async getSiteDataSinks(
        projectId: string,
        siteId: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<DataSink[]> {
        const connection = getConnection();
        const query = `
        SELECT * FROM data_sinks 
        WHERE site_id = $1 AND 
            project_id = $2 
        ORDER BY data_sink_name
        LIMIT $3
        OFFSET $4
        `;
        const values = [siteId, projectId, limit, offset];
        const { rows } = await connection.query(query, values);
        const dataSinks: DataSink[] = rows.map((row: any) => ({
            data_sink_id: row.data_sink_id,
            data_sink_name: row.data_sink_name,
            project_id: row.project_id,
            site_id: row.site_id,
            data_sink_metadata: row.data_sink_metadata,
        }));
        return dataSinks;
    }

    static async getDataSinkByName(
        projectId: string,
        siteId: string,
        dataSinkName: string
    ): Promise<DataSink | null> {
        const connection = getConnection();
        const query = `SELECT * FROM data_sinks WHERE project_id = $1 AND site_id = $2 AND data_sink_name = $3`;
        const { rows } = await connection.query(query, [projectId, siteId, dataSinkName]);
        if (rows.length === 0) {
            return null;
        }
        const dataSink: DataSink = {
            data_sink_id: rows[0].data_sink_id,
            data_sink_name: rows[0].data_sink_name,
            project_id: rows[0].project_id,
            site_id: rows[0].site_id,
            data_sink_metadata: rows[0].data_sink_metadata,
        };
        return dataSink;
    }

    static async createOrUpdateDataSink(
        dataSink: DataSink
    ): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
        INSERT INTO data_sinks (
            data_sink_name, site_id, project_id, data_sink_metadata
        ) VALUES (
            $1, $2, $3, $4
        ) ON CONFLICT (data_sink_name, site_id, project_id)
            DO UPDATE SET
                data_sink_metadata = EXCLUDED.data_sink_metadata;
        `;
        const values = [
            dataSink.data_sink_name,
            dataSink.site_id,
            dataSink.project_id,
            dataSink.data_sink_metadata,
        ];
        const result = await connection.query(query, values);
        const updateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };
        return updateResult;
    }

    static async deleteDataSink(
        project_id: string,
        site_id: string,
        data_sink_name: string,
    ): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
        DELETE FROM data_sinks 
        WHERE data_sink_name = $1 AND site_id = $2 AND project_id = $3
        `;
        const values = [data_sink_name, site_id, project_id];
        const result = await connection.query(query, values);
        const updateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };
        return updateResult;
    }
} 