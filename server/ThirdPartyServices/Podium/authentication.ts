import { serviceEndpoint } from "../../constants/endpoints"
import JsonContentType from "../../constants/jsonContentType"
import { GenericAxiosError } from "../../helpers/AxiosError"
import { encodeOAuthScopes } from "../../helpers/encodeOAuthScopes"
import { generateRandomString } from "../../helpers/RandomStringGenerator"
import { AxiosResponse } from "../../model/AxiosResponse"
import { EndpointType } from "../../model/EndpointType"
import { ThirdPartyService } from "../../model/ThirdPartyService"
// import { podiumHttpHeader } from "./constants/podiumHttpHeader"
import { PodiumAuthenticationRequestForAccessToken, PodiumAuthenticationRequestForTokenRefresh } from "./model/AuthenticationRequests"
import { GrantType } from "../../Authentication/OAuth2/model/GrantType"
import { PodiumOAuthScope } from "./model/OAuthScope"
import { getPodiumAccessTokenValue, getPodiumAuthTokenValue, getPodiumRefreshTokenValue, updatePodiumAccessTokenValue, updatePodiumLastRefreshValue, updatePodiumRefreshToken, updatePodiumStateValue } from "./stateManager"
import { AccessTokenResponse } from "../../Authentication/OAuth2/model/AccessTokenResponse"
import { refreshAccessToken as oAuthRefreshAccessToken } from "../../Authentication/OAuth2/refreshAccessToken"
import { oAuthAuthenticationHeaderContents } from "../../Authentication/OAuth2/authenticationHeader"
import scopes from './config/oAuthScopes'

const axios = require('axios')

const authUrl = serviceEndpoint[ThirdPartyService.Podium][EndpointType.Authentication]

const clientId: string = process.env.PODIUM_CLIENT_ID!
const clientSecret: string = process.env.PODIUM_CLIENT_SECRET!

export const headerAuthString = async () => await oAuthAuthenticationHeaderContents((await getPodiumAccessTokenValue())!)
// ({'Authorization': `Bearer ${await getPodiumAccessTokenValue()}`})

export const generatePodiumAuthorizationCodeRequestURL = async (): Promise<string> => {
    try {
        //! Authorization Scopes

        const encodedScopes = encodeOAuthScopes<PodiumOAuthScope>(scopes)
    
        const stateValue: string = generateRandomString(128)

        try {
            await updatePodiumStateValue(stateValue)
        } catch (error) {
            return new Promise((_, reject) => reject(error))
        }
    
        const encodeUri = () => {
            const uriBase = `${authUrl}/authorize?client_id=`
            const uriAuthString = `${clientId}&redirect_uri=${process.env.PODIUM_REDIRECT_URI}&scope=${encodedScopes}&state=${stateValue}`
    
            return `${uriBase}${uriAuthString}`
        }
    
        const requestUri: string = encodeUri()

        return new Promise((resolve) => resolve(requestUri))
    } catch (error) {
        console.error("ERROR: Unable to generate Podium AuthCode request URI")
        return new Promise((_, reject) => reject(error))
    }    
}

export const redeemAuthorizationCodeForAccessToken = async (authorizationCode: string): Promise<AccessTokenResponse> => {
    const requestUrl = `${authUrl}/token`
    const requestObject: PodiumAuthenticationRequestForAccessToken = {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: process.env.PODIUM_REDIRECT_URI!,
        grant_type: GrantType.AuthenticationRequest,
        code: authorizationCode
    } 

    const requestObjectJSON = JSON.stringify(requestObject)

    try {
        const result: AxiosResponse  = await axios.post(requestUrl, requestObjectJSON, {
            headers: { ...JsonContentType } 
        })

        if (result.status !== 200) throw GenericAxiosError(result)
        
        const responseData: AccessTokenResponse = result.data

        return new Promise((resolve) => resolve(responseData))
    } catch (error) {
        console.error("ERROR: Could not get Podium Access token")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}

export const refreshAccessToken = async () => await oAuthRefreshAccessToken(
    ThirdPartyService.Podium,
    `${authUrl}/token`,
    clientId,
    clientSecret,
    getPodiumRefreshTokenValue,
    getPodiumAccessTokenValue,
    updatePodiumAccessTokenValue,
    updatePodiumRefreshToken
)