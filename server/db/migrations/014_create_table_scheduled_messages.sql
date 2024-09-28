CREATE TABLE scheduled_messages (
    contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    type scheduled_message_type NOT NULL,
    message_text text NOT NULL,
    scheduled_time timestamp without time zone,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    active boolean NOT NULL DEFAULT true,
    appointment_id integer NOT NULL REFERENCES boulevard_appointments(id) ON DELETE SET NULL ON UPDATE SET NULL
);

CREATE UNIQUE INDEX scheduled_messages_contact_id_type_idx ON scheduled_messages(contact_id int4_ops,type enum_ops);