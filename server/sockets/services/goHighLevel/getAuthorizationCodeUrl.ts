import { SocketResponse } from "../.."
import { generateGHLAccessCodeRequestURL } from "../../../ThirdPartyServices/GoHighLevel/authentication/generateAccessCodeRequestURL"
import { SocketFunctionEntry } from "../../../model/SocketFunctionEntry"

export const requestCallString = 'REQUEST_goHighLevelAuthCodeUrl'
export const responseCallString = 'RESPONSE_goHighLevelAuthCodeUrl'

export const getAuthorizationCodeUrl: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (_) => new Promise((resolve) => resolve(generateGHLAccessCodeRequestURL()))
}