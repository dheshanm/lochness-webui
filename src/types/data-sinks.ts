// CREATE TABLE public.data_sinks (
//   data_sink_id serial PRIMARY KEY,
//   data_sink_name text NOT NULL,
//   site_id text NOT NULL,
//   project_id text NOT NULL,
//   data_sink_metadata jsonb NOT NULL
// );

export type DataSink = {
    data_sink_id?: number; // optional, for details
    data_sink_name: string;
    site_id: string;
    project_id: string;
    data_sink_metadata: {
        [key: string]: any;
    };
}; 