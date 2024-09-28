import { CronTask, announceToConsole as _announceToConsole } from '../../../lib/CronTask'
import { everyHour, everyNMinutes, everyTenMinutes, everyThirtySeconds } from "../../../constants/cronIntervals"
import { minutesToMilliseconds } from "../../../helpers/UnitConversions"
import { getPodiumAccessTokenValue, getPodiumLastRefreshValue } from "../stateManager"
import { refreshAccessToken } from "../authentication"
import { MutexTypes, getMutex, modifyMutex } from '../../../controllers/MutexController'
import { ThirdPartyService } from '../../../model/ThirdPartyService'

const taskName = "Refresh Podium Access Token"

//? Refresh every 8 hours
const refreshIntervalInHours = 8

const refreshTokenTask = CronTask(everyNMinutes(1), taskName, async () => {
    const service = ThirdPartyService.Podium
    const mutexType = MutexTypes.TokenRefresh

    const announceToConsole = (text) => _announceToConsole(taskName, text)

    
    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    // Check for access token
    if (!await getPodiumAccessTokenValue()) {
        announceToConsole("No Podium access token found, skipping refresh")
        return
    }

    // Check for mutex
    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            const currentTime = Date.now()
            const lastRefreshTime = Number(await getPodiumLastRefreshValue())

            const refreshIntervalInMilliseconds = minutesToMilliseconds(60 * refreshIntervalInHours)

            const refreshTime = lastRefreshTime + refreshIntervalInMilliseconds
            
            // announceToConsole(`NOW: ${currentTime}`)
            // announceToConsole(`Last Refresh: ${lastRefreshTime}`)
            // announceToConsole(`Next Refresh At: ${refreshTime}`)

            // Needs Refreshing
            if (currentTime > refreshTime) {

                announceToConsole("Access Token Refresh Needed")

                try {
                    await refreshAccessToken()
                    announceToConsole("Refreshed Access Token Successfully")
                } catch (error) {
                    announceToConsole("Failed to Refresh Access Token")
                    await unlockMutex()
                }
            } else announceToConsole("No Token Refresh Needed")

            await unlockMutex()
        } catch (error) {
            console.error("Unable to refresh podium access token")
            console.error(error)

            await unlockMutex()
            // return new Promise((_, reject) => reject(error))
        }
    }
})

module.exports = refreshTokenTask