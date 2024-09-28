import { serviceEndpoint } from "../../../../constants/endpoints";
import { AxiosResponse } from "../../../../model/AxiosResponse";
import { EndpointType } from "../../../../model/EndpointType";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { podiumHttpHeader } from "../../constants/podiumHttpHeader";
import { ApiResponse } from "../../model/ApiResponse";
import { ContactTag } from "../../model/ContactTag";
import { ContactObjectTag } from "../../model/ContactObjectTag";
import { addTagToTracker } from "../../tagTracker/addTagToTracker";
import { doesTagTrackerHaveTag } from "../../tagTracker/doesTagTrackerHaveTag";

const axios = require("axios")

const apiUrl = `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/contact_tags`


export const getAllTags = async () : Promise<ContactTag[]> => {
    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<ContactTag[]>> = await axios.get(apiUrl, {...await podiumHttpHeader()}) 

        if (status !== 200) {
            throw new Error(statusText)
        }

        const tags: ContactTag[] = data.data

        return new Promise(resolve => resolve(tags))
    } catch(error) {
        console.error("Error: Unable to get contact tags from Podium")
        console.error(error)

        return new Promise((_, reject) => reject(error))

    }
}

export const createContactTag = async(tag: ContactObjectTag): Promise<ContactTag> => {
    const { description, label } = tag

    let tagAlreadyInTracker: boolean
    try {
        const value: boolean = await doesTagTrackerHaveTag(tag.label)
        tagAlreadyInTracker = value
    } catch (error) {
        return new Promise((_, reject) => reject(error))
    }
    if (tagAlreadyInTracker) {
        return new Promise((_, reject) => reject(new Error("Tag already in Podium tag tracker -- should not be creating a new tag")))
    }

    let newTag: ContactTag
    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<ContactTag>> = await axios
            .post(apiUrl, { description, label }, await podiumHttpHeader())

        if (status !== 200) throw new Error(statusText)

        const { data: _newTag } = data

        newTag = _newTag

    } catch (error) {
        console.error("Error: Unable to create Podium contact tag")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    try {
        await addTagToTracker(newTag.label, newTag.uid)

        return new Promise((resolve) => resolve(newTag))
    } catch (error) {
        console.error(`Error: Unable to add contact tag ${label}:${newTag.uid} to tracker`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}



export {}

