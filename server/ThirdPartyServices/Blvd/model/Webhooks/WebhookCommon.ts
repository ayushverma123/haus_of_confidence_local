export type WebhookCommon<T,> = {
    apiApplicationId: string,
    businessId: string,
    data: { node: T },
    event: string,
    eventType: string,
    idempotencyKey: string,
    resource: string,
    timestamp: string,
    webhookId: string
}