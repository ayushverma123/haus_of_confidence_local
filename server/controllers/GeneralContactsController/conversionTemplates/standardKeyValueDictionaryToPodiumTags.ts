import { justTitleAndId } from "../../../ThirdPartyServices/Podium/controllers/ContactTagsController/justTitleAndId"
import { ContactObjectTag } from "../../../ThirdPartyServices/Podium/model/ContactObjectTag"
import { getContactObjectTagArrayFromTagTracker } from "../../../ThirdPartyServices/Podium/tagTracker/getContactObjectTagArrayFromTagTracker"
import { Maybe } from "../../../model/Maybe"

export const standardKeyValueDictionaryToPodiumTags = async (existingFields, currentTags: {[key: string]: string}): Promise<any> => {         
 
    const allPodiumTags: ContactObjectTag[] = await getContactObjectTagArrayFromTagTracker()
    
    // Convert these tags to podium podium Tag

    //@ts-ignore
    const tagResults: ContactObjectTag[] = await Object.keys(currentTags).reduce(async (acc: ContactObjectTag[], tagKey: string): Promise<ContactObjectTag[]> => {
        const name = currentTags[tagKey]

        const existingTags = await acc

        // Need to look for equivalent tag on Podium services and if found, return uid
        const uid: Maybe<string> = (() => {
            // const _value = justTitleAndId[name.toLowerCase()]
            const _value = justTitleAndId(allPodiumTags)[name]
            if (typeof(_value) === 'undefined') return undefined
            return _value.uid
        })()

        return new Promise((resolve) => resolve([
            ...existingTags,
            {
                description: name,
                label: name,
                uid
            }
        ]))
    
    }, [])

    return new Promise((resolve) => resolve({
        ...existingFields,
        tags: tagResults
    }))
}