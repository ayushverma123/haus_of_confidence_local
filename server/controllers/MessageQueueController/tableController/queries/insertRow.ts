import { PodiumMessageChannel } from '../../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessageChannel'
import { GeneralContact } from '../../../../model/GeneralContact'
import tableName from '../../constants/tableName'
import { MessageStatus } from '../../model/MessageStatus'

export const insertRow = (recipient: GeneralContact, communicateUsing: PodiumMessageChannel, text: string, status: MessageStatus) => ({
    text: `
        INSERT INTO ${tableName} (
            recipient,
            communicate_using,
            status,
            text
        ) VALUES($1, $2, $3, $4)
        RETURNING *`,
    values: [
        recipient.id!,
        communicateUsing,
        status,
        text
    ]
})