export enum AutomatedMessageTrigger {
    BoulevardAppointmentCreated = 'blvd.appointment.created',
    BoulevardAppointmentUpdated = 'blvd.appointment.updated',
    BoulevardAppointmentCancelled = 'blvd.appointment.cancelled',
    BoulevardAppointmentCompleted = 'blvd.appointment.completed',
    BoulevardAppointmentRescheduled = 'blvd.appointment.rescheduled',
    BoulevardAppointmentActive = 'blvd.appointment.active',
    BoulevardAppointmentConfirmed = 'blvd.appointment.confirmed',
    BoulevardAppointmentArrived = 'blvd.appointment.arrived',

    GHLLeadCreated = 'ghl.lead.created',

    TimeSpecificWithtimezone = 'time.specific.withtimezone',
    TimeRelativeWithtimezone = 'time.relative.withtimezone',
    TimeSpecific = 'time.specific',
    // TimeRelative = 'time.relative',

    CustomFunction = 'custom.function', 
    // Custom function will be a custom function that has access to all the current data, as in the other Appointment types,
    // and the result will be a boolean that determines if the message should be sent or not at that specific time
    // so the function will basically be like (currentTime: string (epoch), dataObject:any) => boolean
}