//{"eventTypes":["contact.created"],"locationUid":"123123","organizationUid":"1232132","secret":"asdsasa","url":"https://"}

import { WebhookType } from "../WebhookType"

export type WebhookRequestObject = {
    eventTypes: WebhookType[],
    locationUid?: string,
    organizationUid?: string,
    secret: string,
    url: string
}