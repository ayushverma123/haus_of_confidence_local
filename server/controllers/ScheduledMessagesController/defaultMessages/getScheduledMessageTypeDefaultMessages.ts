import { Maybe } from "../../../model/Maybe"
import { ScheduledMessageType } from "../model/ScheduledMessageType"
import { _stateStore } from "./defaultsStore"

export const getScheduledMessageTypeDefaultMessages = async (
    messageType: ScheduledMessageType,
): Promise<Maybe<string[]>> => {
    try {
        const result: Maybe<string[]> = await _stateStore.getValue<string[]>(messageType)

        return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error(`Unable to get ${messageType} scheduled message default message`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}