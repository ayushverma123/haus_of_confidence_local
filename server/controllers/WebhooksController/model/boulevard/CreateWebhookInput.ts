import { Id } from "../../../../ThirdPartyServices/Blvd/model/Id"
import { WebhookSubscriptionInput } from "./WebhookSubscriptionInput"

export type CreateWebhookInput = {
    locationId?: Id,
    name?: string,
    subscriptions: [WebhookSubscriptionInput],
    url: string
}