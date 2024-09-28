// import { getAllScheduledMessages as _getAllScheduledMessages } from "../../controllers/ScheduledMessagesController/getAllScheduledMessages"
import { getAllAutomatedMessageConfigurations } from "../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurations"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString: string = 'REQUEST_getAllAutomatedMessages'
export const responseCallString: string = 'RESPONSE_getAllAutomatedMessages'

export const getAllAutomatedMessages: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (_) => {
        try {
            const allAutomatedMessages = await getAllAutomatedMessageConfigurations(false)
            
            return new Promise((resolve) => resolve(allAutomatedMessages))
        } catch (error) {
            console.error(`Socket function could not get all Automated messages`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }
}