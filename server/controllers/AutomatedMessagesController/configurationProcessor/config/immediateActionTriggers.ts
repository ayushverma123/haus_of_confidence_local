import { AutomatedMessageTrigger } from "../../model/AutomatedMessageTrigger";

const immediateActionTriggers: AutomatedMessageTrigger[] = [
    AutomatedMessageTrigger.BoulevardAppointmentCreated,
    AutomatedMessageTrigger.BoulevardAppointmentUpdated,
    AutomatedMessageTrigger.BoulevardAppointmentCancelled,
    AutomatedMessageTrigger.BoulevardAppointmentCompleted,
    AutomatedMessageTrigger.BoulevardAppointmentRescheduled,
    AutomatedMessageTrigger.BoulevardAppointmentActive,
    AutomatedMessageTrigger.BoulevardAppointmentConfirmed,
    AutomatedMessageTrigger.BoulevardAppointmentArrived,
    AutomatedMessageTrigger.GHLLeadCreated
]

export default immediateActionTriggers