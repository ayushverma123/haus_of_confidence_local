import { Contact } from "../Contact"
import { CustomField } from "../CustomField"
import { OpportunityStatus } from "./OpportunityStatus"

export type Opportunity = {
    id: string,
    name: string,
    monetaryValue: string,
    pipelineId: string,
    pipelineStageId: string,
    assignedTo: string,
    status: OpportunityStatus,
    source: string,
    lastStatusChangeAt: string,
    lastStageChangeAt: string,
    lastActionDate: string,
    indexVersion: string,
    createdAt: string,
    updatedAt: string,
    contactId: string,
    locationId: string,
    contact: Contact,
    notes: Array<string>,
    tasks: Array<string>,
    calendarEvents: Array<string>,
    customFields: Array<CustomField>
}