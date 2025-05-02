// CREATE TABLE public.data_sources (
// 	data_source_name text NOT NULL,
// 	data_source_is_active bool DEFAULT true NULL,
// 	site_id text NOT NULL,
// 	project_id text NOT NULL,
// 	data_source_type text NULL,
// 	data_source_metadata jsonb NOT NULL,
// 	CONSTRAINT data_sources_pkey PRIMARY KEY (data_source_name, site_id, project_id),
// 	CONSTRAINT data_sources_data_source_type_fkey FOREIGN KEY (data_source_type) REFERENCES public.supported_data_source_types(data_source_type),
// 	CONSTRAINT data_sources_site_id_project_id_fkey FOREIGN KEY (site_id,project_id) REFERENCES <?>()
// );
export type DataSource = {
    data_source_name: string;
    data_source_is_active: boolean;
    site_id: string;
    project_id: string;
    data_source_type: string;
    data_source_metadata: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
};
