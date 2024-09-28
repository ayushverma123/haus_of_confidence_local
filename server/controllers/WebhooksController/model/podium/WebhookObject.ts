import { WebhookType } from "../WebhookType"

export type WebhookObject = {
    createdAt: string,
    disabled: boolean,
    eventTypes: WebhookType[],
    locationUid: string,
    organizationUid: string,
    secret: string,
    uid: string,
    updatedAt: string,
    url: string
}