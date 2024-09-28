import { Id } from "../../../../ThirdPartyServices/Blvd/model/Id"

export type WebhookSubscriptionInput = {
    delete: boolean,
    eventType: string,
    id?: Id,
    maxRetries: number
}