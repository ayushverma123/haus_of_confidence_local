import { MessageQueueTableRow } from "../../../../../../controllers/MessageQueueController/model/MessageQueueTableRow"
import { getAllMessageQueueEntries } from "../../../../../../controllers/MessageQueueController/tableController/getAllMessageQueueEntries"

export const getMessageQueueMatches = async (contactId: string, messageText: string) => (await getAllMessageQueueEntries()).filter(
    (entry: MessageQueueTableRow) => {
        const { id: entryId, recipient, text, status } = entry

        const idsMatch = contactId! === `${recipient}`
        const textMatches = text === messageText

        return idsMatch && textMatches
    })