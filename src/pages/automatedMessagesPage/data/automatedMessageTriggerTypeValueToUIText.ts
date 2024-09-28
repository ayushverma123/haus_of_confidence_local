import { AutomatedMessageTrigger } from "../../../model/AutomatedMessages/AutomatedMessageTrigger";

export const automatedMessageTriggerTypeValueToTextUiMap: { [key in AutomatedMessageTrigger]: string } = {
    [AutomatedMessageTrigger.BoulevardAppointmentActive]: "Appointment Active",
    [AutomatedMessageTrigger.BoulevardAppointmentArrived]: "Appointment Arrived",
    [AutomatedMessageTrigger.BoulevardAppointmentConfirmed]: "Appointment Confirmed",
    [AutomatedMessageTrigger.BoulevardAppointmentCreated]: "Appointment Created",
    [AutomatedMessageTrigger.BoulevardAppointmentCancelled]: "Appointment Cancelled",
    [AutomatedMessageTrigger.BoulevardAppointmentCompleted]: "Appointment Completed",
    [AutomatedMessageTrigger.BoulevardAppointmentRescheduled]: "Appointment Rescheduled",
    [AutomatedMessageTrigger.BoulevardAppointmentUpdated]: "Appointment Updated",

    [AutomatedMessageTrigger.CustomFunction]: "Custom Function",

    [AutomatedMessageTrigger.GHLLeadCreated]: "GHL Lead Created",

    [AutomatedMessageTrigger.TimeSpecificWithtimezone]: "Time Specific With Timezone",
    [AutomatedMessageTrigger.TimeRelativeWithtimezone]: "Time Relative With Timezone",
    [AutomatedMessageTrigger.TimeSpecific]: "Time Specific",
}
