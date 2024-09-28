import { WebhookType } from "../WebhookType";

export const boulevardEventTypeToEventType: {[key: string]: WebhookType} = {
    CLIENT_CREATED: WebhookType.ContactCreated,
    CLIENT_DELETED: WebhookType.ContactDeleted,
    CLIENT_MERGED: WebhookType.ContactMerged,
    CLIENT_UPDATED: WebhookType.ContactUpdated
}