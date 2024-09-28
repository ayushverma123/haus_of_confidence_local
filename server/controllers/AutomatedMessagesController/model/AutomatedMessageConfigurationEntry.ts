import { GeneralContact } from "../../../model/GeneralContact";
import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { AutomatedMessageContactCriteria } from "./AutomatedMessageContactCriteria";
import { AutomatedMessageDataObject } from "./AutomatedMessageDataObject";
import { AutomatedMessageLockType } from "./AutomatedMessageLockType";
import { AutomatedMessageTemplateType } from "./AutomatedMessageTemplateType";
import { AutomatedMessageTrigger } from "./AutomatedMessageTrigger";
import { AutomatedMessageCustomContactCriteriaConfiguration } from "./CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { AutomatedMessageTimeTriggerConfiguration } from "./AutomatedMessageTimeTriggerConfiguration";
import { AutomatedMessageCustomTriggerConfiguration } from "./AutomatedMessageCustomTriggerConfiguration";
import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry";
import { AutomatedMessageRestrictToHoursConfigEntry } from "./AutomatedMessageRestrictToHoursConfigEntry";
import { Maybe } from "../../../model/Maybe";
import AutomatedMessageSendMessageTo from "./AutomatedMessageSendMessageTo";

export type GeneralContactIDToAutomatedMessageDataObjectMap = {[key: number]: AutomatedMessageDataObject}
export type AutomatedMessagesCustomFunction <T,> = (currentTime: Date, allContacts: GeneralContact[], allAppointments: BoulevardAppointmentsTableRow[]) => Promise<T>

export type CustomTriggerFunction = AutomatedMessagesCustomFunction<boolean> // (currentTime: Date, allContacts: GeneralContact[], allAppointments: BoulevardAppointmentsTableRow[]) => Promise<boolean>

export type ContactCriteriaFunctionReturn = {
    contacts: GeneralContact[],
    data?: GeneralContactIDToAutomatedMessageDataObjectMap,
    error?: {[generalContactId: number]: Maybe<any[]>}
}

// export type CustomContactCriteriaFunction =  AutomatedMessagesCustomFunction<ContactCriteriaFunctionReturn> // (currentTime: Date, allContacts: GeneralContact[], allAppointments: BoulevardAppointmentsTableRow[], ) => Promise<ContactCriteriaFunctionReturn>
export type CustomContactCriteriaFunction = (configuration: AutomatedMessageCustomContactCriteriaConfiguration, allContacts: GeneralContact[]) => Promise<ContactCriteriaFunctionReturn> // (currentTime: Date, allContacts: GeneralContact[], allAppointments: BoulevardAppointmentsTableRow[], ) => Promise<ContactCriteriaFunctionReturn>

export interface AutomatedMessageConfigurationEntry {
    id: number,
    scheduleName: string,
    triggerType: AutomatedMessageTrigger,
    timeTrigger?: AutomatedMessageTimeTriggerConfiguration,
    // customTriggerFunction?: CustomTriggerFunction,
    templateType: AutomatedMessageTemplateType,
    templateCustom?: string[],
    contactCriteria: AutomatedMessageContactCriteria,
    // contactCriteriaCustomFunction?: CustomContactCriteriaFunction
    // Intention is to create a filter function that returns the array of GeneralContacts needed
    // ALL GeneralContacts with their associated appointment data will be the input
    createdAt: string,
    updatedAt: string,
    enabled: boolean,
    lockType: AutomatedMessageLockType,
    customTriggerConfig: AutomatedMessageCustomTriggerConfiguration,
    contactCriteriaConfig: AutomatedMessageCustomContactCriteriaConfiguration,
    restrictToHours: AutomatedMessageRestrictToHoursConfigEntry,
    sendMessageTo: AutomatedMessageSendMessageTo,
    staffMessageTemplates: string[]
}

