import { Maybe } from "graphql/jsutils/Maybe"
import { GenericAxiosError } from "../../helpers/AxiosError"
import { AxiosResponse } from "../../model/AxiosResponse"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { AccessTokenResponse } from "./model/AccessTokenResponse"
import { GrantType } from "./model/GrantType"
import { RefreshTokenRequest } from "./model/RefreshTokenRequest"
import { oAuthAuthenticationHeaderContents } from "./authenticationHeader"

const axios = require('axios')

export const refreshAccessToken = async (
    service: ThirdPartyService,
    requestUrl: string,
    clientId: string,
    clientSecret: string,
    getRefreshTokenFunction: () => Promise<Maybe<string>>,
    getAccessTokenFunction: () => Promise<Maybe<string>>,
    updateAccessTokenFunction: (accessToken: string) => Promise<string>,
    updateRefreshTokenFunction: (refreshToken: string) => Promise<string>
): Promise<boolean> => {

    let oldAccessToken: string
    try {
        const _oldAccessToken = await getAccessTokenFunction()

        if (Object.is(_oldAccessToken, null) || typeof(_oldAccessToken) === 'undefined') {
            throw new Error('Old accessToken is null or undefined')
        }
        oldAccessToken = _oldAccessToken!
    } catch (error) {
        console.error(`Could not get access token for ${service}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }


    let refreshToken: string
    try {
        const _refreshToken = await getRefreshTokenFunction()

        if (Object.is(_refreshToken, null) || typeof(_refreshToken) === 'undefined') {
            throw new Error('refreshToken is null or undefined')
        }
        refreshToken = _refreshToken!
    } catch (error) {
        console.error(`Could not get refresh token for ${service}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    const requestObject: RefreshTokenRequest = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: GrantType.RefreshToken,
        refresh_token: refreshToken
    }

    let requestResult: AccessTokenResponse
    try {
        const response: AxiosResponse = await axios.post(requestUrl, JSON.stringify(requestObject), { headers: oAuthAuthenticationHeaderContents(oldAccessToken) })

        if (response.status !== 200) {
            throw GenericAxiosError(response)
        }

        requestResult = response.data

    } catch (error) {
        console.error(`Could not refresh access token for ${service}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    const { access_token, refresh_token } = requestResult

    if (typeof(access_token) === 'undefined' || typeof(refresh_token) === 'undefined') {
        throw new Error(`Missing access_token or refresh_token in result\naccess_token: ${access_token}\nrefresh_token: ${refresh_token}`)
    }

    await updateAccessTokenFunction(access_token)
    await updateRefreshTokenFunction(refresh_token)

    return new Promise((resolve) => resolve(true))

}