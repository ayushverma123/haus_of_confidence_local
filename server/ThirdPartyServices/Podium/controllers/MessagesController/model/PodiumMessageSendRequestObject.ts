import { PodiumMessageChannelObject } from "./PodiumMessageChannelObject";

export interface PodiumMessageSendRequestObject {
    body: string,
    channel: PodiumMessageChannelObject,
    contactName?: string,
    locationUid: string,
    senderName?: string,
    subject?: string,
    setOpenInbox?: boolean
}