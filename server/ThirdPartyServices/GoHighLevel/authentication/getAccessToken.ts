import { type } from "os"
import { AccessTokenRequest } from "../../../Authentication/OAuth2/model/AccessTokenRequest"
import { GrantType } from "../../../Authentication/OAuth2/model/GrantType"
import { RefreshTokenRequest } from "../../../Authentication/OAuth2/model/RefreshTokenRequest"
import { serviceEndpoint } from "../../../constants/endpoints"
import { EndpointType } from "../../../model/EndpointType"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { getGHLAuthToken } from "../stateManager"
import { AxiosResponse } from "../../../model/AxiosResponse"
import { ghlHttpHeader } from "../constants/ghlHttpHeader"
import { GenericAxiosError } from "../../../helpers/AxiosError"
import { GHLAccessTokenResponse } from "./model/GHLAccessTokenResponse"

const axios = require('axios')

// TODO 
// const service: ThirdPartyService = //ThirdPartyService.GHL

//@ts-ignore
export const getGHLAccessToken = async (): Promise<GHLAccessTokenResponse> => {
    const url = `${serviceEndpoint[ThirdPartyService.GoHighLevel][EndpointType.Authentication]}/token`

    let authCode: string
    try {
        const _authCode = await getGHLAuthToken()

        if (typeof(_authCode) === 'undefined' || Object.is(_authCode, null)) {
            throw new Error('No auth code found')
        }

        authCode = _authCode
    } catch (error) {
        console.error(`Unable to get GHL Auth Token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    const request: AccessTokenRequest = {
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: GrantType.AuthenticationRequest,
        code: authCode
    }

    // let accessCode, refreshToken: string, string
    try {
        const result: AxiosResponse = await axios.post(url, JSON.stringify(request), await ghlHttpHeader())

        if (result.status !== 200) throw GenericAxiosError(result)

        const responseData: GHLAccessTokenResponse = result.data

        return new Promise((resolve) => resolve(responseData))

    } catch (error) {
        console.error(`Unable to get GHL Access Token`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}
