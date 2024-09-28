export type WebhookData<T,> = {
    after: T,
    before: T,
    errors?: []
}