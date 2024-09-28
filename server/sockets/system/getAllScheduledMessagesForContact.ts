import { getAllScheduledMessagesForContact as _getAllScheduledMessagesForContact } from "../../controllers/ScheduledMessagesController/getAllScheduledMessagesForContact"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString: string = 'REQUEST_getAllScheduledMessagesForContact'
export const responseCallString: string = 'RESPONSE_getAllScheduledMessagesForContact'

export const getAllScheduledMessagesForContact: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (contactId: number) => {
        try {
            const allScheduledMessages = await _getAllScheduledMessagesForContact(contactId)

            return new Promise((resolve) => resolve(allScheduledMessages))
        } catch (error) {
            console.error(`Socket function could not get all scheduled messages for contact ${contactId}.`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }
}