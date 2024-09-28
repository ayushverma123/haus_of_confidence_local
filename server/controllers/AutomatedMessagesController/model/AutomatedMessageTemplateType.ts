export enum AutomatedMessageTemplateType {
    PreappointmentConfirmation = "preappointment.confirmation",
    PreappointmentFriendlytext = "preappointment.friendlytext",

    AppointmentCreated = "appointment.created",
    AppointmentUpdated = "appointment.updated",
    AppointmentCancelled = "appointment.cancelled",
    AppointmentCompleted = "appointment.completed",
    AppointmentRescheduled = "appointment.rescheduled",
    AppointmentActive = "appointment.active",
    AppointmentConfirmed = "appointment.confirmed",
    AppointmentArrived = "appointment.arrived",
    
    CancelledAppointmentStillinterestedImmediate = "appointment.cancelled.stillinterested.immediate",
    CancelledAppointmentStillinterestedLater = "appointment.cancelled.stillinterested.later",
    
    PostappointmentThankyou = "postappointment.thankyou",
    PostappointmentFollowup = "postappointment.followup",
    PostappointmentCheckin = "postappointment.checkin",
    PostappointmentScheduleNext = "postappointment.schedule.next",
    
    LeadCreated = "lead.created",
    
    //TODO - This one tells the code not to use a template from the database
    Custom = "custom",
}

export type AutomatedMessageTemplateTypeMap <T,> = {[key in AutomatedMessageTemplateType]: T}