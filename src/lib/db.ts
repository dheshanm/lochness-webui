import { Pool } from 'pg';

let connection: Pool | undefined;

if (!connection) {
    // Check if the environment variables are set
    if (!process.env.PG_user || !process.env.PG_host || !process.env.PG_database || !process.env.PG_password) {
        throw new Error("Missing required environment variables for database connection");
    }
    connection = new Pool({
        user: process.env.PG_user,
        host: process.env.PG_host,
        database: process.env.PG_database,
        password: process.env.PG_password,
        port: process.env.PG_port ? parseInt(process.env.PG_port, 10) : undefined,
        ssl: {
            rejectUnauthorized: false,
        }
    });
}

export function getConnection(): Pool {
    if (!connection) {
        throw new Error("Database connection is undefined");
    }
    return connection;
}

export default connection;
