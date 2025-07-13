export type DataPush = {
    data_push_id: number;
    data_sink_id: number;
    file_path: string;
    file_md5: string;
    push_time_s: number;
    push_timestamp: string;
    push_metadata: {
        [key: string]: any;
    };
    // Joined data from data_sinks table
    data_sink_name?: string;
    data_sink_metadata?: {
        [key: string]: any;
    };
    // Joined data from data_pull table
    subject_id?: string;
    data_source_name?: string;
}; 