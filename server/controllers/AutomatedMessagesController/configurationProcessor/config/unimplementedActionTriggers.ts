import { AutomatedMessageTrigger } from "../../model/AutomatedMessageTrigger";

const unimplementedActionTriggers: AutomatedMessageTrigger[] = [
    AutomatedMessageTrigger.TimeSpecificWithtimezone,
    AutomatedMessageTrigger.TimeRelativeWithtimezone,
    AutomatedMessageTrigger.GHLLeadCreated

]

export default unimplementedActionTriggers