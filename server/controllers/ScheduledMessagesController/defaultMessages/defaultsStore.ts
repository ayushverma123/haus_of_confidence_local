import systemServiceId from '../../../constants/systemServiceIdentifier'
import { Maybe } from '../../../model/Maybe'
import { StateStore } from '../../StateManager'
import { ScheduledMessageType } from '../model/ScheduledMessageType'
import { StoreState } from './storeState'

const stateId = `${systemServiceId}_scheduled_message_defaults`

export const _stateStore = StateStore<StoreState>(stateId)

export const [modifyValue, getValue] = [
    _stateStore.modifyValue,
    _stateStore.getValue
]

// export const modifyScheduledMessageDefaultMessage = async (
//     messageType: ScheduledMessageType,
//     message: string,
// ): Promise<string> => {
//     try {
//         await _stateStore.modifyValue(messageType, message)

//         return new Promise((resolve) => resolve(message))
//     } catch (error) {
//         console.error(`Unable to modify ${messageType} scheduled message default message`)
//         console.error(error)

//         return new Promise((_, reject) => reject(error))
//     }
// }

// export const getScheduledMessageDefaultMessage = async (
//     messageType: ScheduledMessageType,
// ): Promise<Maybe<string>> => {
//     try {
//         const result: Maybe<string> = await _stateStore.getValue<string>(messageType)

//         return new Promise((resolve) => resolve(result))
//     } catch (error) {
//         console.error(`Unable to get ${messageType} scheduled message default message`)
//         console.error(error)

//         return new Promise((_, reject) => reject(error))
//     }
// }