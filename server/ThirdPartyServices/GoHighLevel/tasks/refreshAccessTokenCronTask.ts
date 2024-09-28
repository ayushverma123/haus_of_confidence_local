import { refreshAccessToken } from "../../../Authentication/OAuth2/refreshAccessToken"
import { onNSecondsEveryNMinutes } from "../../../constants/cronIntervals"
import { serviceEndpoint } from "../../../constants/endpoints"
import { MutexTypes, getMutex, modifyMutex } from "../../../controllers/MutexController"
import { minutesToMilliseconds } from "../../../helpers/UnitConversions"
import { CronTask, announceToConsole as _announceToConsole } from "../../../lib/CronTask"
import { EndpointType } from "../../../model/EndpointType"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { getGHLAccessToken, getGHLLastRefresh, getGHLRefreshToken, updateGHLAccessToken, updateGHLRefreshToken } from "../stateManager"

const taskName = "Refresh GoHighLevel Access Token"

//? Refresh every 18 hours
const refreshIntervalInHours = 18

const refreshTokenTask = CronTask(onNSecondsEveryNMinutes(35, 5), taskName, async () => {
    const service = ThirdPartyService.GoHighLevel
    const mutexType = MutexTypes.TokenRefresh

    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    // Check for access token
    if (!await getGHLAccessToken()) {
        announceToConsole(`${service} access token not found, skipping refresh`)
        return
    }

    // Check for mutex
    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            const currentTime = Date.now()
            const lastRefreshTime = Number(await getGHLLastRefresh())
            
            const refreshIntervalInMilliseconds = minutesToMilliseconds(60 * refreshIntervalInHours)
            
            const refreshTime = lastRefreshTime + refreshIntervalInMilliseconds
            
            if (currentTime > refreshTime) {
                
                announceToConsole(`Refreshing ${service} Access Token`)
                
                try {
                    const result = await refreshAccessToken(
                        service,
                        `${serviceEndpoint[ThirdPartyService.GoHighLevel][EndpointType.Authentication]}/token`,
                        process.env.GHL_CLIENT_ID!,
                        process.env.GHL_CLIENT_SECRET!,
                        getGHLRefreshToken,
                        getGHLAccessToken,
                        updateGHLAccessToken,
                        updateGHLRefreshToken
                    )

                    if (!result) throw new Error("Failed to refresh access token")

                    announceToConsole(`Refreshed ${service} Access Token Successfully`)

                } catch (error) {
                    announceToConsole(`Error refreshing ${service} Access Token`)
                    await unlockMutex()
                }
            } else announceToConsole(`${service} Access Token does not need to be refreshed`)

            await unlockMutex()
 
        } catch (error) {
            console.error(`Unable to refresh ${service} Access Token`)
            console.error(error)

            await unlockMutex()
        }
    }
})

module.exports = refreshTokenTask