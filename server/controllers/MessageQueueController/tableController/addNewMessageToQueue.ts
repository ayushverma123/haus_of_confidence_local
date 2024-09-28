import { PodiumMessageChannel } from "../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessageChannel";
import { GeneralContact } from "../../../model/GeneralContact";
import { MessageQueueTableRow } from "../model/MessageQueueTableRow";
import { MessageStatus } from "../model/MessageStatus";
import { insertRow } from "./queries/insertRow";

const db = require('../../../db')

export const addNewMessageToQueue = async (recipient: GeneralContact, communicateUsing: PodiumMessageChannel, status: MessageStatus, text: string): Promise<MessageQueueTableRow> => {
    try {
        const { rows } = await db.query(insertRow(recipient, communicateUsing, text, status))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive newly created row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to newly created appointment row query was empty')
        }

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not add new message to queue`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}