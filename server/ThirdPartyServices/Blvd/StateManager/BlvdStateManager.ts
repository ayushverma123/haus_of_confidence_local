import { StateStore } from '../../../controllers/StateManager'
import { ThirdPartyService } from '../../../model/ThirdPartyService'
import { TagTracker } from '../../../controllers/StateManager/model/TagTracker'
import { Location } from '../model/Location'
import { Maybe } from '../../../model/Maybe'


const stateId = ThirdPartyService.Boulevard

type ServiceState = {
    webhooksRegistered: boolean,
    tagTracker: TagTracker,
    initialTagTrackerPull: boolean,
    initialContactSyncCompleted: boolean,
    initialAppointmentsSyncCompleted: boolean,
    location: Location
}

export enum StateProperties {
    webhooksRegistered = 'webhooksRegistered',
    tagTracker = 'tagTracker',
    initialTagTrackerPull = 'initialTagTrackerPull',
    initialContactSyncCompleted = 'initialContactSyncCompleted',
    initialAppointmentsSyncCompleted = 'initialAppointmentsSyncCompleted',
    location = 'location'
}

export const _stateStore = StateStore<ServiceState>(stateId)
export const modifyValue = _stateStore.modifyValue
export const getValue = _stateStore.getValue

export const getStateObject = async (): Promise<ServiceState> => {
    try {
        const stateObject = await _stateStore.getObject()

        return new Promise((resolve) => resolve(stateObject))
    } catch (error) {

        return new Promise((_, reject) => reject(error))
    }
}

export const getServiceWebhookRegistrationStatus = async (): Promise<boolean> => {
    try {
        const webhooksRegistered = await getValue<boolean>(StateProperties.webhooksRegistered)

        if (webhooksRegistered === null || typeof(webhooksRegistered) === 'undefined') {
            await updateServiceWebhookRegistrationStatus(false)

            return new Promise((resolve) => resolve(false))
        }

        return new Promise((resolve) => resolve(webhooksRegistered))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Boulevard webhooks registered value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateServiceWebhookRegistrationStatus = async (allRegistered: boolean): Promise<boolean> => {
    try {
        const newValue = await modifyValue<boolean>(StateProperties.webhooksRegistered, allRegistered)

        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Boulevard WEBHOOKS REGISTERED value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getTagTracker = async (): Promise<TagTracker> => {
    try {
        const tagTracker = await getValue<TagTracker>(StateProperties.tagTracker)

        if (typeof(tagTracker) === 'undefined') {
            return new Promise((resolve) => resolve({}))
        }

        return new Promise((resolve) => resolve(tagTracker))
    } catch (error) {
        console.error("ERROR: Could not retrieve tag tracker for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateTagTracker = async (newTagTracker: TagTracker): Promise<boolean> => {
    try {
        await modifyValue<TagTracker>(StateProperties.tagTracker, newTagTracker)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error("ERROR: Unable to update tag tracker for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getInitialTagTrackerPull = async(): Promise<boolean> => {
    try {
        const initialTagTrackerPull = await getValue<boolean>(StateProperties.initialTagTrackerPull)

        if (typeof(initialTagTrackerPull) === "undefined") {
            return new Promise((resolve) => resolve(false))
        }

        return new Promise((resolve) => resolve(initialTagTrackerPull || false))
    } catch (error) {
        console.error("ERROR: Could not retrieve tag tracker pull value for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateTagTrackerPull = async (completed: boolean): Promise<boolean> => {
    try {
        await modifyValue<boolean>(StateProperties.initialTagTrackerPull, completed)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error("ERROR: Unable to update tag tracker pull value for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getInitialContactImportCompletedValue = async (): Promise<boolean> => {
    try {
        const initialContactSyncCompleted = await getValue<boolean>(StateProperties.initialContactSyncCompleted)

        if (typeof(initialContactSyncCompleted) === 'undefined') return new Promise((resolve) => resolve(false))

        return new Promise((resolve) => resolve(initialContactSyncCompleted!))
    } catch (error) {
        console.error("ERROR: Unable to get initial contact import completed value for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateInitialContactImportCompletedValue = async (completed: boolean): Promise<boolean> => { 
    try {
        await modifyValue<boolean>(StateProperties.initialContactSyncCompleted, completed)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error("ERROR: Unable to update initial contact import completed value for Boulevard")
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}

export const getInitialAppointmentsSyncCompletedValue = async (): Promise<boolean> => {
    try {
        const initialAppointmentsSyncCompleted = await getValue<boolean>(StateProperties.initialAppointmentsSyncCompleted)

        if (typeof(initialAppointmentsSyncCompleted) === 'undefined') return new Promise((resolve) => resolve(false))

        return new Promise((resolve) => resolve(initialAppointmentsSyncCompleted!))
    } catch (error) {
        console.error("ERROR: Unable to get initial appointment import completed value for Boulevard")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateInitialAppointmentsSyncCompletedValue = async (completed: boolean): Promise<boolean> => { 
    try {
        await modifyValue<boolean>(StateProperties.initialAppointmentsSyncCompleted, completed)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error("ERROR: Unable to update initial appointment import completed value for Boulevard")
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}

export const getLocationData = async (): Promise<Maybe<Location>> => {
    try {
        const location: Maybe<Location> = await getValue<Location>(StateProperties.location)

        return new Promise((resolve) => resolve(location))
    } catch (error) {
        console.error("ERROR: Unable to get location data from Boulevard state store")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateLocationData = async (newLocation: Location): Promise<Location> => {
    try {
        await modifyValue<Location>(StateProperties.location, newLocation)

        return new Promise((resolve) => resolve(newLocation))
    } catch (error) {
        console.error("ERROR: Unable to update location data in Boulevard state store")
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}