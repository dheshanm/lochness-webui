// CREATE TABLE public.data_sinks (
// 	data_sink_id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
// 	site_id text NOT NULL,
// 	project_id text NOT NULL,
// 	data_sink_name text NULL,
// 	data_sink_metadata jsonb NOT NULL,
// 	CONSTRAINT data_sinks_pkey PRIMARY KEY (data_sink_id),
// 	CONSTRAINT data_sinks_site_id_project_id_fkey FOREIGN KEY (site_id,project_id) REFERENCES <?>()
// );

export type DataSink = {
    data_sink_id?: number; // Optional for creation, required for updates
    site_id: string;
    project_id: string;
    data_sink_name?: string; // Optional, can be null
    data_sink_metadata: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
};