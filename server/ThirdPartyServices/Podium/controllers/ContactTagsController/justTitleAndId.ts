import { ContactObjectTag } from "../../model/ContactObjectTag"
import { ContactTag } from "../../model/ContactTag"
import { titleAndIdDict } from "./model/TitleAndId"
export const justTitleAndId = (allPodiumTags: ContactTag[] | ContactObjectTag[]): titleAndIdDict => allPodiumTags
//@ts-ignore
.map(({ uid, description, label }) => ({
    label,
    description,
    uid
}))
//@ts-ignore
.reduce((acc: titleAndIdDict, cv: {
    label,
    description,
    uid
}) => ({
    ...acc,
    // [cv.label.toLowerCase()]: {
        [cv.label]: {
            label: cv.label,
            uid: cv.uid
        }
    }), {}) as titleAndIdDict