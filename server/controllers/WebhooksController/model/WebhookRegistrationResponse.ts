import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { WebhookType } from "./WebhookType"
import { GeneralWebhookObject } from "./GeneralWebhookObject"

export type WebhookRegistrationResponse = {
    service: ThirdPartyService,
    webhook: WebhookType,
    hasError: boolean,
    errorMessage?: string,
    successful: boolean,
}

export const WebhookRegistrationResponse = (service: ThirdPartyService, webhook: WebhookType, hasError: boolean, errorMessage: string | undefined = undefined) => (
    {
        service,
        webhook,
        hasError,
        errorMessage: hasError ? `Bad response from ${service} when creating Webhook ${webhook}: ${errorMessage}` : undefined,
        successful: !hasError,
    }
)