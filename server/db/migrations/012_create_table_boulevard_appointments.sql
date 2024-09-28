
CREATE TABLE boulevard_appointments (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id integer REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    appointment_id text NOT NULL,
    appointment_object jsonb NOT NULL DEFAULT '{}'::jsonb,
    active boolean NOT NULL DEFAULT false,
    confirmed boolean NOT NULL DEFAULT false,
    completed boolean NOT NULL DEFAULT false,
    cancelled boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    confirmed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    completed_at timestamp without time zone
);

CREATE UNIQUE INDEX boulevard_appointments_contact_id_appointment_id_idx ON boulevard_appointments(contact_id int4_ops,appointment_id text_ops);
