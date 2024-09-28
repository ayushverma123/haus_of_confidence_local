import { StateStore } from "../../../controllers/StateManager";
import { Maybe } from "../../../model/Maybe";
import { ServiceState } from "./model/ServiceState";
import { StateProperties } from "./model/StateProperties";

// TODO -- Replace with ThirdPartyService.GHL when it is implemented
const stateId = 'GoHighLevel'

const _stateStore = StateStore<ServiceState>(stateId)
const modifyValue = _stateStore.modifyValue
const getValue = _stateStore.getValue

export const getGHLStateObject = async (): Promise<ServiceState> => {
    try {
        const stateObject: ServiceState = await _stateStore.getObject()

        return new Promise((resolve) => resolve(stateObject))
    } catch (error) {
        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLAccessToken = async (): Promise<Maybe<string>> => {
    try {
        const value: Maybe<string> = await getValue<string>(StateProperties.accessToken)

        return new Promise((resolve) => resolve(value))
    } catch (error) {
        console.error(`Error getting GHL access token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLAccessToken = async (accessToken: string): Promise<string> => {
    try {
        const newValue: string = await modifyValue<string>(StateProperties.accessToken, accessToken)
        await modifyValue<string>(StateProperties.lastRefresh, `${Date.now()}`)

        return new Promise((resolve) => resolve(newValue))

    } catch (error) {
        console.error(`Error updating GHL access token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLAuthToken = async (): Promise<Maybe<string>> => {
    try {
        const value: Maybe<string> = await getValue<string>(StateProperties.authToken)

        return new Promise((resolve) => resolve(value))
    } catch (error) {
        console.error(`Error getting GHL auth token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLRegistrationStatus = async (): Promise<boolean> => {
    try {
        const value: Maybe<string> = await getGHLAuthToken()

        const exists = (() => {
            if (typeof(value) === 'undefined' || Object.is(value, null)) return false
            if (value.length === 0) return false
            return true
        })()

        return new Promise((resolve) => resolve(exists))

    } catch (error) {
        console.error(`Error getting GHL registration status`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLAuthToken = async (authToken: string): Promise<string> => {
    try {
        const newValue: string = await modifyValue<string>(StateProperties.authToken, authToken)

        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error(`Error updating GHL auth token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLRefreshToken = async (): Promise<Maybe<string>> => {
    try {
         const value: Maybe<string> = await getValue<string>(StateProperties.refreshToken)

         return new Promise((resolve) => resolve(value))
    } catch (error) {
        console.error(`Error getting GHL refresh token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLRefreshToken = async (refreshToken: string): Promise<string> => {
    try {
        const newValue: string = await modifyValue<string>(StateProperties.refreshToken, refreshToken)

        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error(`Error updating GHL refresh token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLLastRefresh = async (): Promise<Maybe<string>> => {
    try {
        const value: Maybe<string> = await getValue<string>(StateProperties.lastRefresh)
        
        return new Promise((resolve) => resolve(value))
    } catch (error) {
        console.error(`Error getting GHL last refresh`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLLastRefresh = async (): Promise<string> => {
    const lastRefresh = `${Date.now()}`

    try {
        const newValue: string = await modifyValue<string>(StateProperties.lastRefresh, lastRefresh)

        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error(`Error updating GHL last refresh`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLOauthState = async (): Promise<Maybe<string>> => {
    try {
        const value: Maybe<string> = await getValue<string>(StateProperties.state)

        return new Promise((resolve) => resolve(value))

    } catch (error) {
        console.error(`Error getting GHL oauth state`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLOauthState = async (state: string): Promise<string> => {
    try {
        const newValue: string = await modifyValue<string>(StateProperties.state, state)

        return new Promise((resolve) => resolve(newValue))

    } catch (error) {
        console.error(`Error updating GHL oauth state`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}

export const getGHLWebhooksRegistrationStatus = async (): Promise<boolean> => {
    try {
        const value: Maybe<boolean> = await getValue<boolean>(StateProperties.webhooksRegistered)
        
        if (Object.is(value, null) || typeof(value) === 'undefined') {
            await updateGHLWebhooksRegistrationStatus(false)

            return new Promise((resolve) => resolve(false))
        }

        return new Promise((resolve) => resolve(value || false))
    } catch (error) {
        console.error(`Error getting GHL webhooks registered value`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}

export const updateGHLWebhooksRegistrationStatus = async (webhooksRegistered: boolean): Promise<boolean> => {
    try {
        const newValue: boolean = await modifyValue<boolean>(StateProperties.webhooksRegistered, webhooksRegistered)
        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error(`Error updating GHL webhooks registered value`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}