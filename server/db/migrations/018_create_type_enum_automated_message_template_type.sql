CREATE TYPE automated_message_template_type AS ENUM (
    'preappointment.confirmation',
    'preappointment.friendlytext',
        
    'appointment.created',
    'appointment.updated',
    'appointment.cancelled',
    'appointment.cancelled.stillinterested.immediate',
    'appointment.cancelled.stillinterested.later',
    'appointment.completed',
    'appointment.rescheduled',
    'appointment.active',
    'appointment.confirmed',
    'appointment.arrived',

    'postappointment.thankyou',
    'postappointment.followup',
    'postappointment.checkin',
    'postappointment.schedule.next',

    'lead.created',

    'custom'

);