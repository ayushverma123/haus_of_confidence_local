CREATE TABLE messages (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    message_object jsonb NOT NULL DEFAULT '{}'::jsonb,
    original_service third_party_service NOT NULL,
    service_ids jsonb NOT NULL DEFAULT '{}'::jsonb
);
