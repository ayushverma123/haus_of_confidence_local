import { PodiumMessageChannel } from "../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessageChannel";
import { MessageStatus } from "./MessageStatus";

export interface MessageQueueTableRow {
    id: number,
    recipient: number,
    communicate_using: PodiumMessageChannel,
    status: MessageStatus,
    text: string,
    created_at: string,
    updated_at: string,
    retries: number
}