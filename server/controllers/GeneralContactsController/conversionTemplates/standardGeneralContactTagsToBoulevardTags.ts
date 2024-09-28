import { GeneralContactField } from "../../../model/GeneralContact";
import { GeneralContactTags } from "../../../model/GeneralContactTags";
import { Maybe } from "../../../model/Maybe";
import { ThirdPartyService, ThirdPartyServiceMap } from "../../../model/ThirdPartyService";
import { Tag as BlvdTag } from "../../../ThirdPartyServices/Blvd/model/Tag"


export const standardGeneralContactTagsToBoulevardTags = async (
    existingFields, 
    tags: GeneralContactTags, 
    targetService: ThirdPartyService,
    fieldMapping: ThirdPartyServiceMap<{[key in GeneralContactField]: Maybe<string>}>
    ) => ({
    ...existingFields,
    [fieldMapping[targetService][GeneralContactField.tags]!]: Object.keys(tags).reduce((allTags: BlvdTag[], currentTagKey: string): BlvdTag[] => [
        ...allTags,
        {
            name: `${currentTagKey.toLowerCase()}`
        }
    ], [])
})