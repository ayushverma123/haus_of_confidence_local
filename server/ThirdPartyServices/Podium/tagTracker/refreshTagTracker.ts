import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { getAllTags } from "../controllers/ContactTagsController"
import { ContactTag } from "../model/ContactTag"
import { modifyValue } from "../stateManager"
import { StateProperties } from "../stateManager/model/StateProperties"

export const refreshTagTracker = async (): Promise<boolean> => {
    try {
        const tags: ContactTag[] = await getAllTags()
        const tagsAsTagTracker: TagTracker = tags.reduce((acc: TagTracker, tag: ContactTag): TagTracker => {
            const { label, uid } = tag

            return {
                ...acc,
                [label]: uid
            }
        }, {})

        await modifyValue<TagTracker>(StateProperties.tagTracker, tagsAsTagTracker)

        return new Promise((resolve) => resolve(true))
    
    } catch (error) {
        console.error("ERROR: Could not refresh Podium tag tracker")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}