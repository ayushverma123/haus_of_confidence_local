import { Maybe } from "graphql/jsutils/Maybe";
import { SocketResponse } from "../..";
import { getGHLAccessToken } from "../../../ThirdPartyServices/GoHighLevel/stateManager";
import { SocketFunctionEntry } from "../../../model/SocketFunctionEntry";

export const requestCallString: string = `REQUEST_goHighLevelAuthStatus`
export const responseCallString: string = `RESPONSE_goHighLevelAuthStatus`

export const getAuthorizationStatus: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (_) => {
        try {
            const status: Maybe<string> = await getGHLAccessToken()

            const result = (() => {
                if (typeof(status) === 'undefined') return false
                return !Object.is(status, null)
            })()

            return new Promise((resolve) => resolve(result))

        } catch (error) {

            return new Promise((_, reject) => reject(error))
        }
    }
}