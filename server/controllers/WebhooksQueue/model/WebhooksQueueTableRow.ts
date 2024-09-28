import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { WebhookType } from "../../WebhooksController/model/WebhookType"

export type WebhooksQueueTableRow<T = any,> = {
    id: number,
    type: WebhookType,
    service: ThirdPartyService,
    webhook_data: T // TODO: Figure this out eventually, or just cast it when appropriate
    received_at: Date,
    processed: boolean,
    processed_at?: Date,
    success?: boolean,
    error?: Error
}