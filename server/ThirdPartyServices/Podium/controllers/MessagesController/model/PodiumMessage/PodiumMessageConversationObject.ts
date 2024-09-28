import { PodiumMessageChannelObject } from "../PodiumMessageChannelObject";

export interface PodiumMessageConversationObject {
    assignedUserUid: string,
    channel: PodiumMessageChannelObject,
    startedAt: string,
    uid: string,
}