import { getTagTracker, updateTagTracker, updateTagTrackerPull } from "./BlvdStateManager"
import { getAllTags } from "../controllers/TagsController"
import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { Maybe } from "../../../model/Maybe"
import { Id } from "../model/Id"

export const refreshTagTracker = async () => {
    try {
        const allTags = await getAllTags()

        //@ts-ignore
        const tagTrackerObject: TagTracker = allTags.reduce((acc, tag) => ({
            ...acc,
            [tag.name]: tag.id
        }), [])

        await updateTagTracker(tagTrackerObject)
        await updateTagTrackerPull(true)

        // announceToConsole("Successfully Pulled Boulevard Tags from Server")
    } catch (error) {
        console.error('Unable to retrieve Boulevard tags')
        console.error(error)

        return new Promise((_, reject) => reject(error))

        // await unlockMutex()
    }
}

// export const doesTagTrackerHaveTag = async (tagLabel: string): Promise<boolean> => {
//     try {
//         const tagTracker: TagTracker = await getTagTracker()

//         const exists: boolean = typeof(tagTracker[tagLabel]) !== 'undefined'
        
//         return new Promise((resolve) => resolve(exists))
//     } catch (error) {
//         console.error(`Unable to check tag tracker for ${tagLabel}`)
//         return new Promise((_, reject) => reject(error))
//     }
// }

export const getTrackerValue = async (tagLabel: string): Promise<Maybe<string>> => {
    try {
        const tagTracker: TagTracker = await getTagTracker()
        const value: Maybe<Id> = tagTracker[tagLabel]

        const exists: boolean = typeof(value) !== 'undefined'

        if (!exists) return new Promise((resolve) => resolve(undefined))

        return new Promise((resolve) => resolve(`${value}`))
    } catch (error) {
        console.error(`Unable to check tag tracker for value ${tagLabel}`)
        console.error(error) 

        return new Promise((_, reject) => reject(error))
    }
}