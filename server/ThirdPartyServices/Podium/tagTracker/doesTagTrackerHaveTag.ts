import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { Maybe } from "../../../model/Maybe"
import { getValue } from "../stateManager"
import { StateProperties } from "../stateManager/model/StateProperties"

export const doesTagTrackerHaveTag = async (tag: string): Promise<boolean> => {
    try {

        const tracker: Maybe<TagTracker> = await getValue<TagTracker>(StateProperties.tagTracker)

        if (typeof(tracker) === "undefined" || Object.is(tracker, null)) {
            return new Promise(resolve => resolve(false))
        }

        const matchId: Maybe<string> = tracker![tag]
        const hasMatch: boolean = !(typeof(matchId) === "undefined" || Object.is(matchId, null))

        return new Promise(resolve => resolve(hasMatch))


    } catch (error) {
        console.error(`Error in Podium doesTagTrackerHaveTag -- unable to check if tag ${tag} is present in the tag tracker`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}