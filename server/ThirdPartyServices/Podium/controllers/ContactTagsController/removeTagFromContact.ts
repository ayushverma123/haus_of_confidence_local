import { serviceEndpoint } from "../../../../constants/endpoints";
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController";
import { secondsToMilliseconds } from "../../../../helpers/UnitConversions";
import { Wait } from "../../../../helpers/Wait";
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate";
import { EndpointType } from "../../../../model/EndpointType";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { podiumHttpHeader } from "../../constants/podiumHttpHeader";
const axios = require("axios")


const apiUrl = (contactID: string, tagId: string) => `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/contacts/${contactID}/tags/${tagId}`

export const removeTagFromContact = async (contactID: string, tagId: string): Promise<boolean> => {
    console.debug(`Removing tag ${tagId} from contact ${contactID}`)

    if (typeof(tagId) === 'undefined' || tagId.length === 0) {
        throw new Error("Tag ID cannot be undefined or empty")
    }
    
    try {
        await axios.delete(apiUrl(contactID, tagId), await podiumHttpHeader())

        await incrementServiceIdLock(ThirdPartyService.Podium, CreateOrUpdate.Update, contactID)

        // Wait(secondsToMilliseconds(1))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Unable to remove tag ${tagId} to contact ${contactID}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}