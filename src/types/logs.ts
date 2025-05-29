// CREATE TABLE public.logs (
// 	log_id serial4 NOT NULL,
// 	log_level public.log_level NOT NULL,
// 	log_message jsonb NOT NULL,
// 	log_timestamp timestamptz DEFAULT now() NULL,
// 	CONSTRAINT logs_pkey PRIMARY KEY (log_id)
// );

export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export type Log = {
    log_level: LogLevel;
    log_message: Record<string, unknown>;
    log_timestamp: Date;
}