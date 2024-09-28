import { StateStore } from "../../../controllers/StateManager"
import { Maybe } from "../../../model/Maybe"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { getAllTags } from "../controllers/ContactTagsController"
import { ContactTag } from "../model/ContactTag"
import { ServiceState } from "./model/ServiceState"
import { StateProperties } from "./model/StateProperties"

const stateId = ThirdPartyService.Podium

const _stateStore = StateStore<ServiceState>(stateId)
export const modifyValue = _stateStore.modifyValue
export const getValue = _stateStore.getValue

//? Retreives the podium state object from the database.
//? If the state object does not exist, it will be created and then returned.
export const getPodiumStateObject = async (): Promise<ServiceState> => {    
    try {
        const stateObject = await _stateStore.getObject()

        return new Promise((resolve) => resolve(stateObject))
    }
    catch (error) {
    
        return new Promise((_, reject) => reject(error))
    }
}

//#region Authentication Store Modification
export const getPodiumOauthStateValue = async (): Promise<string> => {
    try {
        // const { state } = await getPodiumStateObject()
        const state = await getValue<string>(StateProperties.state)

        return new Promise((resolve, _) => resolve(state || ''))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium state value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumStateValue = async (newState: string): Promise<string> => {
    try {
        const newValue = await modifyValue<string>(StateProperties.state, newState)
        return new Promise((resolve, _) => resolve(newValue))

    } catch (error) {
        console.error("ERROR: Could not update Podium STATE value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumAuthTokenValue = async (): Promise<Maybe<string>> => {
    try {
        // const { authToken } = await getPodiumStateObject()
        const authToken = await getValue<string>(StateProperties.authToken)
        return new Promise((resolve) => resolve(authToken))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium auth token value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumAuthTokenValue = async (authToken: string): Promise<string> => {
    try {
        const newValue = await modifyValue<string>(StateProperties.authToken, authToken)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not update Podium auth token value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumAccessTokenValue = async (): Promise<Maybe<string>> => {
    try {
        // const { accessToken } = await getPodiumStateObject()
        const accessToken = await getValue<string>(StateProperties.accessToken)

        return new Promise((resolve) => resolve(accessToken))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium access token value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumAccessTokenValue = async (accessToken: string): Promise<string> => {
    try {
        const newValue = await modifyValue<string>(StateProperties.accessToken, accessToken)
        await modifyValue<string>(StateProperties.lastRefresh, `${Date.now()}`)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not update Podium access token value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumRefreshTokenValue = async (): Promise<Maybe<string>> => {
    try {
        // const { refreshToken } = await getPodiumStateObject()

        const refreshToken = await getValue<string>(StateProperties.refreshToken)

        return new Promise((resolve) => resolve(refreshToken))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium refresh token value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumRefreshToken = async (newToken: string): Promise<string> => {
    try {
        const newValue = await modifyValue<string>(StateProperties.refreshToken, newToken)
        await modifyValue<string>(StateProperties.lastRefresh, `${Date.now()}`)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Podium REFRESH_TOKEN value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumLastRefreshValue = async (): Promise<Maybe<string>> => {

    try {
        // const { lastRefresh } = await getPodiumStateObject()

        const lastRefresh = await getValue<string>(StateProperties.lastRefresh)

        return new Promise((resolve) => resolve(lastRefresh))

    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium last refresh value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumLastRefreshValue = async (): Promise<string> => {

    const newDate = Date.now().toString()

    try {
        const newValue = await modifyValue<string>(StateProperties.lastRefresh, newDate)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Podium LAST_REFRESH value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
//#endregion

export const getPodiumWebhookCheckCompletedValue = async (): Promise<boolean> => {

    try {
        // const { webhooksRegistered } = await getPodiumStateObject()

        const webhooksRegistered = await getValue<boolean>(StateProperties.webhooksRegistered)

        if (webhooksRegistered === null || typeof(webhooksRegistered) === "undefined") {
            // update value to false
            await updatePodiumWebhookCheckCompletedValue(false)

            return new Promise((resolve) => resolve(false))
        }

        return new Promise((resolve) => resolve(webhooksRegistered))
    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium webhook registered value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumWebhookCheckCompletedValue = async (webhooksRegistered: boolean): Promise<boolean> => {
    try {
        const newValue = await modifyValue<boolean>(StateProperties.webhooksRegistered, webhooksRegistered)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Podium WEBHOOKS REGISTERED value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumInitialContactSyncCompletedValue = async (): Promise<boolean> => {
    try {
        // const { initialContactSyncCompleted } = await getPodiumStateObject()

        const initialContactSyncCompleted = await getValue<boolean>(StateProperties.initialContactSyncCompleted)

        if (typeof(initialContactSyncCompleted) === 'undefined') {
            return new Promise((resolve) => resolve(false))
        }

        return new Promise((resolve) => resolve(initialContactSyncCompleted))
    } catch (error) {
        console.error("ERROR: Unable to retrieve Podium Initial Contact Sync Completed value")
        console.error(error) 

        return new Promise((_, reject)=> reject(error))
    }
}

export const updatePodiumInitialContactSyncCompletedValue = async (initialContactSyncCompleted: boolean): Promise<boolean> => {
    try {
        const newValue = await modifyValue<boolean>(StateProperties.initialContactSyncCompleted, initialContactSyncCompleted)

        return new Promise((resolve, _) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Podium INITIAL_CONTACT_SYNC_COMPLETED value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getPodiumOrganizationIdValue = async (): Promise<Maybe<string>> => {
    try {
        const organizationId = await getValue<string>(StateProperties.organizationId)

        return new Promise((resolve) => resolve(organizationId))
    } catch (error) {
        console.error("ERROR: Could not get Podium organizationId value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updatePodiumOrganizationIdValue = async (organizationId: string): Promise<string> => {
    try {
        const newValue = await modifyValue<string>(StateProperties.organizationId, organizationId)

        return new Promise((resolve) => resolve(newValue))
    } catch (error) {
        console.error("ERROR: Could not alter Podium ORGANIZATION_ID value")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}