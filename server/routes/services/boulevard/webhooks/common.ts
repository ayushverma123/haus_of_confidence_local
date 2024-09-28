import { StandardWebhookDataResponse } from "./StandardWebhookDataResponse"

export const getStandardWebhookData = <EventType, EventDataType> (body: EventType, noBodyNode: boolean = false): StandardWebhookDataResponse<EventType, EventDataType> => {
    const event: EventType = body
    //@ts-ignore
    const data: EventDataType = event.data.node

    return { event, data }
}