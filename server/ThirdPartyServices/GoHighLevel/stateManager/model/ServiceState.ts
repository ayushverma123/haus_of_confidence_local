export type ServiceState = {
    accessToken?: string,
    // authToken?: string,
    refreshToken?: string,
    lastRefresh?: string,
    state?: string,
    webhooksRegistered: boolean
}