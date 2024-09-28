import { SocketResponse } from "../../";
import { getPodiumAccessTokenValue } from "../../../ThirdPartyServices/Podium/stateManager";
import { SocketFunctionEntry } from "../../../model/SocketFunctionEntry";

export const requestCallString = 'REQUEST_podiumAuthStatus'
export const responseCallString = 'RESPONSE_podiumAuthStatus'

export const getAuthorizationStatus: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (_) => {
        try {
            const status = await getPodiumAccessTokenValue()

            const result = (() => {
                if (typeof(status) === 'undefined') return false
                return !Object.is(status, null)
            })()

            return new Promise((resolve) => resolve(
                result
                // status === null || typeof(status) === 'undefined' ? false : true
            ))
        } catch (error) {
            return new Promise((_,reject) => reject(error))
        }
    }
}
