import { ScheduledMessageMap } from "../model/ScheduledMessageMap";
import { ScheduledMessageType } from "../model/ScheduledMessageType";
import { getScheduledMessageTypeDefaultMessages } from "./getScheduledMessageTypeDefaultMessages";

//@ts-ignore
export const getAllScheduledMessageTypeMessageDefaults = (): ScheduledMessageMap<string[]> => {
    const allTypeKeys = Object.keys(ScheduledMessageType)

    //@ts-ignore
    return allTypeKeys.reduce(async (acc: Promise<ScheduledMessageMap<string[]>>, key: string): Promise<ScheduledMessageMap<string[]>> => {
        const type: ScheduledMessageType = ScheduledMessageType[key]
        const existing: ScheduledMessageMap<string[]> = await acc

        try {

            const returnValue = {
                ...existing,
                [type]: await getScheduledMessageTypeDefaultMessages(type)
            }

            return new Promise((resolve) => resolve(returnValue))
        } catch (error) {
            console.error(`Error get all defaults for scheduled message type: ${type}`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }, {})
}

export {}