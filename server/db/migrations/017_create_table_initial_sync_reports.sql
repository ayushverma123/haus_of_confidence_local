CREATE TABLE initial_sync_reports (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_service third_party_service NOT NULL,
    destination_service third_party_service NOT NULL,
    contact_object jsonb NOT NULL DEFAULT '{}'::jsonb,
    name text,
    phone text,
    email text
);

-- Indices -------------------------------------------------------

-- CREATE UNIQUE INDEX initial_sync_reports_pkey ON initial_sync_reports(id int4_ops);
-- CREATE UNIQUE INDEX initial_sync_reports_name_phone_email_source_service_idx ON initial_sync_reports(name text_ops,phone text_ops,email text_ops,source_service enum_ops);
-- CREATE UNIQUE INDEX initial_sync_reports_email_idx ON initial_sync_reports(email text_ops);
-- CREATE UNIQUE INDEX initial_sync_reports_phone_idx ON initial_sync_reports(phone text_ops);
