import appointmentActive from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentActive"
import appointmentArrived from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentArrived"
import appointmentCancelled from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentCancelled"
import appointmentCompleted from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentCompleted"
import appointmentConfirmed from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentConfirmed"
import appointmentCreated from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentCreated"
import appointmentRescheduled from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentRescheduled"
import appointmentUpdated from "../../ThirdPartyServices/Blvd/webhooks/actions/appointmentUpdated"
import { contactCreated, contactUpdated } from "../../ThirdPartyServices/Blvd/webhooks/actions/contactCreatedOrUpdated"
import { opportunityCreated } from "../../ThirdPartyServices/GoHighLevel/webhooks/actions/opportunityCreated"
import createOrUpdateContact, { podiumContactUpdated } from "../../ThirdPartyServices/Podium/webhooks/actions/contactCreatedOrUpdated"
import contactDeleted from "../../ThirdPartyServices/Podium/webhooks/actions/contactDeleted"
import messageFailed from "../../ThirdPartyServices/Podium/webhooks/actions/messageFailed"
import messageSent from "../../ThirdPartyServices/Podium/webhooks/actions/messageSent"
import { WebhookType } from "../../controllers/WebhooksController/model/WebhookType"
import { WebhooksQueueTableRow } from "../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { runServiceFunctionMapEntryFunction } from "./helpers/runServiceFunctionMapEntryFunction"

// TODO 
const webhookTypeProcessingFunction: {[key in WebhookType]: (queueEntry: WebhooksQueueTableRow) => Promise<boolean>} = {
    // TODO - TESTING NEEDED
    [WebhookType.AppointmentCreated]: appointmentCreated,
    
    // TODO - TESTING NEEDED
    [WebhookType.AppointmentUpdated]: appointmentUpdated,

    // TODO - TESTING NEEDED
    [WebhookType.AppointmentCancelled]: appointmentCancelled,

    [WebhookType.AppointmentCompleted]: appointmentCompleted,

    // TODO - TESTING NEEDED
    [WebhookType.AppointmentRescheduled]: appointmentRescheduled,
    
    [WebhookType.AppointmentActive]: appointmentActive,
    [WebhookType.AppointmentConfirmed]: appointmentConfirmed,
    [WebhookType.AppointmentArrived]: appointmentArrived,

    // TODO
    [WebhookType.ContactCreated]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => runServiceFunctionMapEntryFunction(queueEntry, {
        // TODO -- TESTING NEEDED
        [ThirdPartyService.Boulevard]: contactCreated,
        [ThirdPartyService.GoHighLevel]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
            throw new Error('Not Implemented')
        },
        // TODO -- TESTING NEEDED
        [ThirdPartyService.Podium]: createOrUpdateContact
    }),

    // TODO - TESTING NEEDED
    [WebhookType.ContactDeleted]: contactDeleted,

    // TODO
    [WebhookType.ContactMerged]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => runServiceFunctionMapEntryFunction(queueEntry, {
        // TODO
        [ThirdPartyService.Boulevard]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
            return true
        },
        [ThirdPartyService.GoHighLevel]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
            throw new Error('Not Implemented')
        },
        // TODO
        [ThirdPartyService.Podium]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
            return true
        }
    }),

    // TODO
    [WebhookType.ContactUpdated]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => runServiceFunctionMapEntryFunction(queueEntry, {
        // TODO -- TESTING NEEDED
        [ThirdPartyService.Boulevard]: contactUpdated,
        [ThirdPartyService.GoHighLevel]: async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
            throw new Error('Not Implemented')
        },
        // TODO -- TESTING NEEDED
        [ThirdPartyService.Podium]: podiumContactUpdated
    }),

    // TODO -- TESTING NEEDED
    [WebhookType.MessageFailed]: messageFailed,

    // TODO -- TESTING NEEDED
    [WebhookType.MessageSent]: messageSent,

    // TODO -- TESTING NEEDED
    [WebhookType.OpportunityCreated]: opportunityCreated,

    [WebhookType.OpportunityDeleted]: async (): Promise<boolean> => {
        throw new Error('Opportunity Deleted Webhook not yet implemented')
    },

    [WebhookType.OpportunityAssignedToUpdate]: async (): Promise<boolean> => {
        throw new Error('Opportunity Assigned To Update Webhook not yet implemented')
    },

    [WebhookType.OpportunityStatusUpdate]: async (): Promise<boolean> => {
        throw new Error('Opportunity Status Update Webhook not yet implemented')
    },

    [WebhookType.OpportunityMonetaryValueUpdate]: async (): Promise<boolean> => {
        throw new Error('Opportunity Monetary Value Update Webhook not yet implemented')
    },

    [WebhookType.OpportunityStageUpdate]: async (): Promise<boolean> => {
        throw new Error('Opportunity Stage Update Webhook not yet implemented')
    },

}

export default webhookTypeProcessingFunction