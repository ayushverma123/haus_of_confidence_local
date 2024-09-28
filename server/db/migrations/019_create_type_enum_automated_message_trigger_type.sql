CREATE TYPE automated_message_trigger_type AS ENUM (
    'blvd.appointment.created',
    'blvd.appointment.updated',
    'blvd.appointment.cancelled',
    'blvd.appointment.completed',
    'blvd.appointment.rescheduled',
    'blvd.appointment.active',
    'blvd.appointment.confirmed',
    'blvd.appointment.arrived',

    'ghl.lead.created',

    'time.specific.withtimezone',
    'time.relative.withtimezone',
    'custom.function'
);