import { updateAutomatedMessageEntryStatus } from "../../controllers/AutomatedMessagesController/tableController/updateAutomatedMessageEntryStatus"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString = 'REQUEST_updateAutomatedMessageActiveValue'
export const responseCallString = 'RESPONSE_updateAutomatedMessageActiveValue'

type inputType = {
    id: number,
    active: boolean
}

export const updateAutomatedMessageActiveValue: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (input: string) => {
        const { id, active }: inputType = JSON.parse(input)

        try {
            // await _updateScheduledMessageActiveValue(contactId, type, active)
            await updateAutomatedMessageEntryStatus(id, active)

            return new Promise((resolve) => resolve(active))
        } catch (error) {
            console.error(`Socket function could not alter automated message active value for id: ${id}`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }

    }
}