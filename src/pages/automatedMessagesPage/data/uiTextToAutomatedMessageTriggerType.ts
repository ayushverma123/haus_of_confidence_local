import { AutomatedMessageTrigger } from "../../../model/AutomatedMessages/AutomatedMessageTrigger";

export const uiTextToScheduledMessageType: { [key: string]: AutomatedMessageTrigger } = {
    "Appointment Active": AutomatedMessageTrigger.BoulevardAppointmentActive,
    "Appointment Arrived": AutomatedMessageTrigger.BoulevardAppointmentArrived,
    "Appointment Confirmed": AutomatedMessageTrigger.BoulevardAppointmentConfirmed,
    "Appointment Created": AutomatedMessageTrigger.BoulevardAppointmentCreated,
    "Appointment Cancelled": AutomatedMessageTrigger.BoulevardAppointmentCancelled,
    "Appointment Completed": AutomatedMessageTrigger.BoulevardAppointmentCompleted,
    "Appointment Rescheduled": AutomatedMessageTrigger.BoulevardAppointmentRescheduled,
    "Appointment Updated": AutomatedMessageTrigger.BoulevardAppointmentUpdated,
    
    "Custom Function": AutomatedMessageTrigger.CustomFunction,

    "GHL Lead Created": AutomatedMessageTrigger.GHLLeadCreated,
    
    "Time Specific With Timezone": AutomatedMessageTrigger.TimeSpecificWithtimezone,
    "Time Relative With Timezone": AutomatedMessageTrigger.TimeRelativeWithtimezone,
    "Time Specific": AutomatedMessageTrigger.TimeSpecific,
}
