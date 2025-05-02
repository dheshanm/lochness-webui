import { getConnection } from "@/lib/db";

import { DBUpdateResult } from "@/types/dbUpdateResult";
import { DataSource } from "@/types/data-sources";

export class DataSources {
    static async getSupportedDataSourceTypes(): Promise<string[]> {
        const connection = getConnection();
        const query = `SELECT data_source_type FROM supported_data_source_types`;

        const { rows } = await connection.query(query);
        const dataSourceTypes: string[] = rows.map((row: DataSource) => row.data_source_type);  // Wrong Type
        return dataSourceTypes;
    }

    static async getSiteDataSources(
        projectId: string,
        siteId: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<DataSource[]> {
        const connection = getConnection();
        const query = `
        SELECT * FROM data_sources 
        WHERE site_id = $1 AND 
            project_id = $2 
        ORDER BY data_source_name
        LIMIT $3
        OFFSET $4
        `;
        const values = [siteId, projectId, limit, offset];
        const { rows } = await connection.query(query, values);
        const dataSources: DataSource[] = rows.map((row: DataSource) => ({
            data_source_name: row.data_source_name,
            data_source_is_active: row.data_source_is_active,
            project_id: row.project_id,
            site_id: row.site_id,
            data_source_metadata: row.data_source_metadata,
            data_source_type: row.data_source_type,
        }));

        return dataSources;
    }

    static async getSiteDataSourcesCount(
        siteId: string,
        projectId: string
    ): Promise<number> {
        const connection = getConnection();
        const query = `SELECT COUNT(*) FROM data_sources WHERE site_id = $1 AND project_id = $2`;
        const { rows } = await connection.query(query, [siteId, projectId]);
        return parseInt(rows[0].count, 10);
    }

    static async getDataSourceById(
        projectId: string,
        siteId: string,
        dataSourceName: string
    ): Promise<DataSource | null> {
        const connection = getConnection();
        const query = `SELECT * FROM data_sources WHERE project_id = $1 AND site_id = $2 AND data_source_name = $3`;
        const { rows } = await connection.query(query, [
            projectId,
            siteId,
            dataSourceName,
        ]);
        if (rows.length === 0) {
            return null;
        }
        const dataSource: DataSource = {
            data_source_name: rows[0].data_source_name,
            data_source_is_active: rows[0].data_source_is_active,
            project_id: rows[0].project_id,
            site_id: rows[0].site_id,
            data_source_metadata: rows[0].data_source_metadata,
            data_source_type: rows[0].data_source_type,
        };
        return dataSource;
    }

    static async createOrUpdateDataSource(
        dataSource: DataSource
    ): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
        INSERT INTO data_sources (
            data_source_name, data_source_is_active, site_id,
            project_id, data_source_type, data_source_metadata
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6
        ) ON CONFLICT (data_source_name, site_id, project_id)
            DO UPDATE SET
                data_source_is_active = EXCLUDED.data_source_is_active,
                data_source_metadata = EXCLUDED.data_source_metadata;
        `;
        const values = [
            dataSource.data_source_name,
            dataSource.data_source_is_active,
            dataSource.site_id,
            dataSource.project_id,
            dataSource.data_source_type,
            dataSource.data_source_metadata,
        ];

        const result = await connection.query(query, values);
        const updateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };

        return updateResult;
    }

    static async deleteDataSource(
        project_id: string,
        site_id: string,
        data_source_name: string,
    ): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
        DELETE FROM data_sources 
        WHERE data_source_name = $1 AND site_id = $2 AND project_id = $3
        `;
        const values = [data_source_name, site_id, project_id];
        const result = await connection.query(query, values);
        const updateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };
        return updateResult;
    }
}