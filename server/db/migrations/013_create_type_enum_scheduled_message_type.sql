CREATE TYPE scheduled_message_type AS ENUM(
	'appointment.created',
	'appointment.updated',
	'appointment.cancelled',
	'appointment.completed',
	'appointment.rescheduled',
	'appointment.active',
	'appointment.confirmed',
	'appointment.arrived'	
);