
import { modifyScheduledMessageTypeDefaultMessage } from "../../controllers/ScheduledMessagesController/defaultMessages/modifyScheduledMessageTypeDefaultMessage"
import { ScheduledMessageType } from "../../controllers/ScheduledMessagesController/model/ScheduledMessageType"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString = `REQUEST_modifyScheduledMessageDefaultValue`
export const responseCallString = `RESPONSE_modifyScheduledMessageDefaultValue`

type _input = {
    type: ScheduledMessageType,
    messages: string[],
}

export const modifyScheduledMessageDefaultValue: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (input: string) => {
        const { type, messages }: _input = JSON.parse(input)

        try {
            await modifyScheduledMessageTypeDefaultMessage(type, messages)

            return new Promise((resolve) => resolve(true))
        } catch (error) {
            console.error(`Socket function could not modify scheduled message default for ${type}`)
            console.error(error)

            return new Promise((resolve) => resolve(false))
        }
    }
} 