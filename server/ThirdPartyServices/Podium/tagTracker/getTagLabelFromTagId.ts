import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { Maybe } from "../../../model/Maybe"
import { getValue } from "../stateManager"
import { StateProperties } from "../stateManager/model/StateProperties"

export const getTagLabelFromTagId = async (tagId: string): Promise<Maybe<string>> => {
    try {

        const tracker: Maybe<TagTracker> = await getValue<TagTracker>(StateProperties.tagTracker)

        if (typeof(tracker) === "undefined" || Object.is(tracker, null)) {
            return new Promise(resolve => resolve(undefined))
        }


        // const matchId: Maybe<string> = tracker![tag]

        const matchId: Maybe<string> = Object.keys(tracker).find( key => tracker[key] === tagId)
        const hasMatch: boolean = !(typeof(matchId) === "undefined" || Object.is(matchId, null))
        
        return new Promise(resolve => resolve(hasMatch ? matchId : undefined))


    } catch (error) {
        console.error(`Error in Podium doesTagTrackerHaveTagId -- unable to check if tagId ${tagId} is present in the tag tracker`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}