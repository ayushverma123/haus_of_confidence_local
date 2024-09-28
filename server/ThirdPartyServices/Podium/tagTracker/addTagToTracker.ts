import { TagTracker } from "../../../controllers/StateManager/model/TagTracker";
import { modifyValue } from "../stateManager";
import { StateProperties } from "../stateManager/model/StateProperties";
import { getTagTracker } from "./getTagTracker";

export const addTagToTracker = async (tag: string, id: string): Promise<boolean> => {
    try {
        await modifyValue<TagTracker>(StateProperties.tagTracker, { ...await getTagTracker(), [tag]: id })

        return new Promise(resolve => resolve(true))
    } catch (error) { 
        console.error(`Could not add Podium tag ${tag} to tracker with id ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}