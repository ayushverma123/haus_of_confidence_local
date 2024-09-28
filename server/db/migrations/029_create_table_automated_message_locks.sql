CREATE TABLE automated_message_locks (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    automated_message_schedule integer REFERENCES automated_message_schedules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    lock_type automated_message_lock_type NOT NULL,
    locks text[] NOT NULL DEFAULT '{}'::text[],
    lock_date timestamp without time zone NOT NULL
);

CREATE UNIQUE INDEX automated_message_locks_automated_message_schedule_lock_type_lo ON automated_message_locks(automated_message_schedule int4_ops,lock_type enum_ops,lock_date timestamp_ops);
