import { PodiumMessageChannelObject } from "../PodiumMessageChannelObject";
import { PodiumMessageContact } from "./PodiumMessageContact";
import { PodiumMessageConversationObject } from "./PodiumMessageConversationObject";
import { PodiumMessageItemsEntry } from "./PodiumMessageItemsEntry";
import { PodiumMessageLocationObject } from "./PodiumMessageLocationObject";
import { PodiumMessageSenderObject } from "./PodiumMessageSenderObject";

export interface PodiumMessage {
    attachmentUrl: string,
    body: string,
    contact: PodiumMessageContact,
    contactName: string,
    conversation: PodiumMessageConversationObject,
    createdAt: string,
    failureReason: string,
    items: PodiumMessageItemsEntry[],
    location: PodiumMessageLocationObject,
    sender: PodiumMessageSenderObject,
    senderUid: string,
    uid: string
}