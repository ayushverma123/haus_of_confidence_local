import { AutomatedMessageTemplateTypeMap } from "../../model/AutomatedMessageTemplateType";

export type ServiceState = {
    templates: AutomatedMessageTemplateTypeMap<string[]>
}