import { AutomatedMessageTrigger } from "../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { SocketEnumTransportObject } from "../../model/SocketEnumTransportObject"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString: string = "REQUEST_getAutomatedMessageTypes"
export const responseCallString: string = "RESPONSE_getAutomatedMessageTypes"


export const getAutomatedMessageTriggerTypes: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (_): Promise<SocketEnumTransportObject> => {
        return new Promise((resolve) => resolve({
            keys: Object.keys(AutomatedMessageTrigger),
            values: Object.values(AutomatedMessageTrigger)
        }))
    }
}