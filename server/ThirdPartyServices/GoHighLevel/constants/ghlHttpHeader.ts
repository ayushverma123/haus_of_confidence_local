import { getGHLAccessToken } from "../stateManager"

export const ghlHttpHeader = async () => ({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getGHLAccessToken()}`
    }
})