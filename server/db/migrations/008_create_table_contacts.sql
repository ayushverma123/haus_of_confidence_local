CREATE TABLE contacts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name text,
    last_name text,
    tags jsonb NOT NULL DEFAULT '{}'::jsonb,
    emails text[] NOT NULL DEFAULT ARRAY[]::text[],
    address text[] NOT NULL DEFAULT ARRAY[]::text[],
    phone_numbers text[] NOT NULL DEFAULT ARRAY[]::text[],
    original_service third_party_service NOT NULL,
    original_contact_object jsonb NOT NULL DEFAULT '{}'::jsonb,
    synced_with_service jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    deleted boolean NOT NULL DEFAULT false,
    deleted_at timestamp without time zone,
    service_ids jsonb NOT NULL DEFAULT '{}'::jsonb
);