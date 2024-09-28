CREATE TABLE webhooks_queue (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type webhook_type NOT NULL,
    service third_party_service NOT NULL,
    webhook_data jsonb NOT NULL,
    received_at timestamp without time zone NOT NULL DEFAULT now(),
    processed_at timestamp without time zone,
    processed boolean NOT NULL DEFAULT false
);