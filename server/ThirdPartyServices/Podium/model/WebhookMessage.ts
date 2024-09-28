import { PodiumMetadata } from "./PodiumMetadata"
import { WebhookData } from "./WebhookData"

export interface WebhookMessage<T> {
    data: WebhookData<T>,
    metadata: PodiumMetadata
}
