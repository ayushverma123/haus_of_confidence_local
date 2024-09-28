import { SocketResponse } from "..";
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry";

export const requestCallString = 'REQUEST_consoleLogin'
export const responseCallString = 'RESPONSE_consoleLogin'

export const loginFrontendUser: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (password: string) => {
        try {
            const passwordCorrect: boolean = password === process.env.FRONTEND_PASSCODE

            return new Promise((resolve) => resolve(passwordCorrect))
        } catch (error) {
            return new Promise((_,reject) => reject(error))
        }
    }
}