import { serviceEndpoint } from "../../../../constants/endpoints";
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController";
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate";
import { EndpointType } from "../../../../model/EndpointType";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { podiumHttpHeader } from "../../constants/podiumHttpHeader";
const axios = require("axios")

const apiUrl = (contactID: string, tagId: string) => `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/contacts/${contactID}/tags/${tagId}`

export const addExistingTagToExistingContact = async (contactID: string, tagId: string): Promise<boolean> => {
    console.debug(`Adding tag ${tagId} to contact ${contactID}`)
    
    try {
        await axios.post(apiUrl(contactID, tagId), undefined, await podiumHttpHeader())

        // await incrementServiceIdLock(ThirdPartyService.Podium, CreateOrUpdate.Update, contactID)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Unable to add tag ${tagId} to contact ${contactID}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}