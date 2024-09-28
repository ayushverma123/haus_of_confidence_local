CREATE TABLE automated_message_schedules (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    schedule_name text NOT NULL CHECK (char_length(schedule_name) >= 3),
    trigger_type automated_message_trigger_type NOT NULL,
    template_type automated_message_template_type NOT NULL,
    contact_criteria automated_message_contact_criteria NOT NULL,
    time_trigger text,
    custom_trigger_function text,
    template_custom text[],
    contact_criteria_custom_function text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    enabled boolean NOT NULL DEFAULT true
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX automated_message_has_unique_name ON automated_message_schedules(schedule_name text_ops);
