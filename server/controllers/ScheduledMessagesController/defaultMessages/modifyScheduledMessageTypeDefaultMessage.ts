import { ScheduledMessageType } from "../model/ScheduledMessageType"
import { _stateStore } from "./defaultsStore"

export const modifyScheduledMessageTypeDefaultMessage = async (
    messageType: ScheduledMessageType,
    messages: string[],
): Promise<string[]> => {
    try {
        await _stateStore.modifyValue(messageType, messages)

        return new Promise((resolve) => resolve(messages))
    } catch (error) {
        console.error(`Unable to modify ${messageType} scheduled message default message`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}