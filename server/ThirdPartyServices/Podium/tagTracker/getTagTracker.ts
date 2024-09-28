import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { Maybe } from "../../../model/Maybe"
import { getValue } from "../stateManager"
import { StateProperties } from "../stateManager/model/StateProperties"

export const getTagTracker = async (): Promise<TagTracker> => {
    try {
        const tracker: Maybe<TagTracker> = await getValue<TagTracker>(StateProperties.tagTracker)

        return new Promise((resolve) => resolve(typeof(tracker) === 'undefined' || Object.is(tracker, null) ? {} : tracker))
    } catch (error) {
        console.error("ERROR: Could not retrieve Podium tag tracker")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}