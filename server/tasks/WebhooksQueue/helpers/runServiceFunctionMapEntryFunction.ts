import { WebhooksQueueTableRow } from "../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow";
import { ThirdPartyService, thirdPartyServiceFromLowercaseServiceName } from "../../../model/ThirdPartyService";

//? This is used to simplify the writing of the webhook tasks that need a service selected first
export const runServiceFunctionMapEntryFunction = (
    queueEntry: WebhooksQueueTableRow, 
    serviceFunctions: {[key in ThirdPartyService]:(queueEntry: WebhooksQueueTableRow) => Promise<boolean> }
) => serviceFunctions[thirdPartyServiceFromLowercaseServiceName[queueEntry.service]]!(queueEntry)
