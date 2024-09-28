// import { GeneralContact } from "../../../model/GeneralContact";
// import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { AutomatedMessageContactCriteria } from "./AutomatedMessageContactCriteria";
// import { AutomatedMessageDataObject } from "./AutomatedMessageDataObject";
import { AutomatedMessageLockType } from "./AutomatedMessageLockType";
import { AutomatedMessageTemplateType } from "./AutomatedMessageTemplateType";
import { AutomatedMessageTrigger } from "./AutomatedMessageTrigger";
import { AutomatedMessageCustomContactCriteriaConfiguration } from "./CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { AutomatedMessageTimeTriggerConfiguration } from "./AutomatedMessageTimeTriggerConfiguration";
import { AutomatedMessageCustomTriggerConfiguration } from "./AutomatedMessageCustomTriggerConfiguration";
import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry";
import { AutomatedMessageRestrictToHoursConfigEntry } from "./AutomatedMessageRestrictToHoursConfigEntry";

// export type GeneralContactIDToAutomatedMessageDataObjectMap = {[key: number]: AutomatedMessageDataObject}

export interface AutomatedMessageConfigurationEntry {
    id: number,
    scheduleName: string,
    triggerType: AutomatedMessageTrigger,
    timeTrigger?: AutomatedMessageTimeTriggerConfiguration,
    templateType: AutomatedMessageTemplateType,
    templateCustom?: string[],
    contactCriteria: AutomatedMessageContactCriteria,
    createdAt: string,
    updatedAt: string,
    enabled: boolean,
    lockType: AutomatedMessageLockType,
    customTriggerConfig: AutomatedMessageCustomTriggerConfiguration,
    contactCriteriaConfig: AutomatedMessageCustomContactCriteriaConfiguration,
    restrictToHours: AutomatedMessageRestrictToHoursConfigEntry
}

