import { everyNMinutes, everyNSeconds, onNSecondsEveryMinute } from "../../../constants/cronIntervals";
import { MutexTypes, getMutex, modifyMutex } from "../../../controllers/MutexController";
import { CronTask, announceToConsole as _announceToConsole } from "../../../lib/CronTask";
import { ThirdPartyService } from "../../../model/ThirdPartyService";
import { getInitialTagTrackerPull, updateTagTracker, updateTagTrackerPull } from "../StateManager/BlvdStateManager";
import { refreshTagTracker } from "../StateManager/TagTracker";
import { getAllTags } from "../controllers/TagsController";
import { TagTracker } from "../../../controllers/StateManager/model/TagTracker";

const service: ThirdPartyService = ThirdPartyService.Boulevard
const taskName = "Populate Boulevard Tag Tracker"

const populateTagTrackerTask = CronTask(onNSecondsEveryMinute(0), taskName, async () => {
    //! Needs to pull all the current tags from the server
    //
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const mutexType = MutexTypes.BlvdTagPull

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    if (await getInitialTagTrackerPull()) {
        announceToConsole('Initial Boulevard Tag Pull has already been completed')
        return
    }

    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            announceToConsole("Pulling Boulevard Tags from Server...")
            
            await refreshTagTracker()
            await unlockMutex()

            announceToConsole("Successfully Pulled Boulevard Tags from Server")
        } catch (error) {
            console.error('Unable to retrieve Boulevard tags')
            console.error(error)

            await unlockMutex()
        }

        return
    } else {
        announceToConsole('Boulevard Tag Pull task is locked by mutex')
        return
    }
})

module.exports = populateTagTrackerTask