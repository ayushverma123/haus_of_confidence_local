export type StandardWebhookDataResponse <EventType, EventDataType> = {
    event: EventType,
    data: EventDataType
}