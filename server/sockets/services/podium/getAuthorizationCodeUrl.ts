import { SocketResponse } from "../../";
import { generatePodiumAuthorizationCodeRequestURL } from "../../../ThirdPartyServices/Podium/authentication";
import { SocketFunctionEntry } from "../../../model/SocketFunctionEntry";

export const requestCallString = 'REQUEST_podiumAuthCodeURL'
export const responseCallString = 'RESPONSE_podiumAuthCodeURL'

export const getAuthorizationCodeUrl: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (_) => {
        try {
            const url = await generatePodiumAuthorizationCodeRequestURL()

            return new Promise((resolve) => resolve(url))
        } catch (error) {
            return new Promise((_,reject) => reject(error))
        }
    }
}