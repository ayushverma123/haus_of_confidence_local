CREATE TYPE webhook_type AS ENUM (
    'appointment.created',
    'appointment.updated',
    'appointment.cancelled',
    'appointment.completed',
    'appointment.rescheduled',
    'appointment.active',
    'appointment.confirmed',
    'appointment.arrived',
    'contact.created',
    'contact.deleted',
    'contact.merged',
    'contact.updated',
    'opportunity.created',
    'opportunity.deleted',
    'message.failed',
    'message.sent'
);