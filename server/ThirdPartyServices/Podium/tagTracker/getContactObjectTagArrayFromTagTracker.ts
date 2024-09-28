import { ContactObjectTag } from "../model/ContactObjectTag";
import { getTagTracker } from "./getTagTracker";

export const getContactObjectTagArrayFromTagTracker = async (): Promise<ContactObjectTag[]> => {
    try {
        const tagTracker = await getTagTracker()
        const result = Object.keys(tagTracker).reduce((allTags: ContactObjectTag[], key: string) => [
            ...allTags,
            {
                description: key,
                label: key,
                uid: tagTracker[key]
            }
        ], [])

        return new Promise(resolve => resolve(result))
    } catch (error) {
        console.error(`Unable to get Podium contact object tag array from tag tracker`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}