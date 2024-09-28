import { secondsToMilliseconds } from "../../helpers/UnitConversions"
import { Wait } from "../../helpers/Wait"
import { CreateOrUpdate, CreateOrUpdateMap } from "../../model/CreateOrUpdate"
import { Maybe } from "../../model/Maybe"
import { ThirdPartyService, ThirdPartyServiceMap } from "../../model/ThirdPartyService"
import { isInitialContactSyncCompleted } from "../../tasks/WebhooksQueue/helpers/isInitialContactSyncCompleted"
import { StateStore, insertRow } from "../StateManager"
import { IdNumericalTypeMap } from "./model/IDNumericalTypeMap"

const stateId = '__system__lock_webhooks'

// ThirdPartyService to expect the event, array is IDs of expected events, 
// type ServiceState = { locks: ThirdPartyServiceMap<string[]> }
type ServiceState = { locks: ThirdPartyServiceMap<CreateOrUpdateMap<IdNumericalTypeMap>> }
enum StateProperties {
    locks = 'locks'
}

export const _stateStore = StateStore<ServiceState>(stateId)
export const modifyValue = _stateStore.modifyValue
export const getValue = _stateStore.getValue

export const getStateObject = async (_stateStore): Promise<Maybe<ServiceState>> => {
    try {
        const stateObject = await _stateStore.getObject()

        if (typeof(stateObject) === 'undefined') {
            await insertRow(stateId)

            return new Promise((resolve) => resolve({
                //@ts-ignore
                locks: Object.values(ThirdPartyService).reduce((acc, cv) => ({
                    [ThirdPartyService[cv]]: {}
                }), {})
            }))
        }

        return new Promise((resolve) => resolve(stateObject))
    } catch (error) {

        // return new Promise((_, reject) => reject(error))
        return new Promise((resolve) => resolve(undefined))
    }
}

// TODO
export const isServiceIdLocked = async (service: ThirdPartyService, createOrUpdate: CreateOrUpdate, contactId: string): Promise<boolean> => {
    await Wait(secondsToMilliseconds(5))
    try {
        // console.log("IS SERVICE ID LOCKED?")

        const stateObject = await getStateObject(_stateStore)

        if (typeof(stateObject) === 'undefined') return new Promise((resolve) => resolve(false))
        if (typeof(stateObject.locks[service]) === 'undefined') return new Promise((resolve) => resolve(false))

        // console.log("LOCKS")
        // console.log(stateObject.locks)

        // return new Promise((resolve) => resolve(stateObject.locks[service].includes(contactId)))

        const locks: Maybe<number> = stateObject.locks[service][createOrUpdate][contactId]

        const hasLock: boolean = (() => {
            if (typeof(locks) === 'undefined') return false
            if (locks <= 0) return false
            if (locks > 0) return true
            return false
        })()

        return new Promise((resolve) => resolve(hasLock))

    } catch (error) {
        // console.error(`Failed to check for webhook lock for ${service} ID ${contactId}`)
        // console.error(error)

        // return new Promise((_, reject) => reject(error))
        return new Promise((resolve) => resolve(false))
    }
}

// TODO
export const incrementServiceIdLock = async (service: ThirdPartyService, createOrUpdate: CreateOrUpdate, contactId: string): Promise<boolean> => {
    // console.log("ADD SERVICE ID LOCK")

    if (!await isInitialContactSyncCompleted()) {
        // Do not apply lock if initialContactSync has not completed

        return new Promise((resolve) => resolve(true))
    }  

    try {
        const stateObject: Maybe<ServiceState> = await getStateObject(_stateStore)
        const { locks: _locks } = stateObject || {}

        const locksEmpty = (() => {
            if (typeof(_locks) === 'undefined') return true
            if (Object.keys(_locks).length <= 0) return true
            return false
        })()

        const locks = (() => {

            // This is a function so it's only calculated if needed
            const initialValue = () => Object.values(ThirdPartyService).reduce((allServices, currentService: string) => ({
                ...allServices,
                [currentService]: Object.values(CreateOrUpdate).reduce((allCreateOrUpdates, currentCreateOrUpdate: string) => ({ 
                    ...allCreateOrUpdates,
                    [currentCreateOrUpdate]: {}
                }), {})
            }), {})


            return locksEmpty ? initialValue() : _locks!
        })()
        
        


        // console.log("NEW LOCKS")

        // const newLocksValue = {
        //     ...locks,
        //     [service]: [
        //         ...(typeof(locks![service]) !== 'undefined' ? locks![service] : []),
        //         contactId
        //     ]
        // }

        const newLocksValue = locksEmpty ? locks : {
            ...locks,
            [service]: {
                ...locks[service],
                [createOrUpdate]: {
                    ...locks[service][createOrUpdate],
                    [contactId]: (locks[service][createOrUpdate][contactId] || 0) + 1
                }
            }
        }

        // console.log(newLocksValue)        

        await modifyValue(StateProperties.locks, newLocksValue)

        return new Promise((resolve) => resolve(true))

    } catch (error) {
        console.error(`Failed to add webhook lock for ${service} ID ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO -- Should reduce value by 1, and remove if 0
export const reduceServiceLockValueByOne = async (service: ThirdPartyService, createOrUpdate: CreateOrUpdate, contactId: string): Promise<boolean> => {

    // console.log("REMOVE SERVICE ID LOCK")

    if (!await isInitialContactSyncCompleted()) {
        // Do not apply lock if initialContactSync has not completed
        // Just return true
        
        return new Promise((resolve) => resolve(true))
    }  

    try {
        const stateObject: Maybe<ServiceState> = await getStateObject(_stateStore)
        const { locks } = stateObject ?? {}

        // console.log("typeof LOCKS", typeof(locks))

        if (typeof(locks) === 'undefined') return new Promise((resolve) => resolve(true))

        if (typeof(locks![service]) === 'undefined') {
            // No entries!
            return new Promise(resolve => resolve(true))
        }

        // console.log("LOCKS FOR SERVICE TYPE")
        // console.log(typeof(locks![service]))

        // const newLocksValue = {
        //     ...locks,
        //     [service]: locks![service].filter((item => item !== contactId))
        // }

        const locksValue = (locks[service][createOrUpdate][contactId] || 0)


        const newLocksValue = {
            ...locks,
            [service]: {
                ...locks[service],
                [createOrUpdate]: {
                    ...locks[service][createOrUpdate],
                    [contactId]: locksValue - 1 <= 0 ? undefined : locksValue - 1
                }
            }
        }

        await modifyValue(StateProperties.locks, newLocksValue)

        return new Promise((resolve) => resolve(true))

    } catch (error) {
        console.error(`Failed to remove webhook lock for ${service} ID ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}