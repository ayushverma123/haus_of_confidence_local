CREATE TABLE message_queue (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    communicate_using communicate_using NOT NULL,
    status message_queue_status NOT NULL DEFAULT 'pending'::message_queue_status,
    text text NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    retries integer NOT NULL DEFAULT 0
);