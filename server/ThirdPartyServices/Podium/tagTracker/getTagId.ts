import { Maybe } from "../../../model/Maybe";
import { doesTagTrackerHaveTag } from "./doesTagTrackerHaveTag";
import { getTagTracker } from "./getTagTracker";

export const getTagId = async (tag: string): Promise<Maybe<string>> => {
    try {
        if (!await doesTagTrackerHaveTag(tag)) return new Promise(resolve => resolve(undefined)) 

        const value: string = (await getTagTracker())[tag]

        return new Promise(resolve => resolve(value))

    } catch (error) {
        console.error(`Error getting Podium tag id: ${tag}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}