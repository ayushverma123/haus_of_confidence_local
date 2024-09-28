import { getAllScheduledMessageTypeMessageDefaults as _getAllScheduledMessageDefaults } from "../../controllers/ScheduledMessagesController/defaultMessages/getAllScheduledMessageTypeMessageDefaults"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString = `REQUEST_getAllScheduledMessageDefaults`
export const responseCallString = `RESPONSE_getAllScheduledMessageDefaults`

export const getAllScheduledMessageDefaults: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (_) => {
        try {
            const getAllScheduledMessageDefaults = await _getAllScheduledMessageDefaults()

            return new Promise((resolve) => resolve(getAllScheduledMessageDefaults))
        } catch (error) {
            console.error(`Socket function could not get all scheduled message defaults`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }
} 