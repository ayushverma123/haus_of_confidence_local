export const oAuthAuthenticationHeaderContents = (token: string): Object => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
})