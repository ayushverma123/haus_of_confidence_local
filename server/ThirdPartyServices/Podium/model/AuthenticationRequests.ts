import { GrantType } from "../../../Authentication/OAuth2/model/GrantType"

export type ClientCredentialsBase = {
    client_id: string,
    client_secret: string,
    grant_type: GrantType
}

export type PodiumAuthenticationRequestForAccessToken = ClientCredentialsBase & {
    code: string,
    redirect_uri: string,
}

export type PodiumAuthenticationRequestForTokenRefresh = ClientCredentialsBase & {
    refresh_token: string
}
