import { createHmac } from "crypto"
import { getWebhookSecret } from "../../../../../controllers/WebhooksController/WebhookStateManager"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"

export const verifyWebhookSignature = async (event: WebhookType, remoteTimestamp: string, remoteSignature: string, requestBody): Promise<boolean> => {
    const signedPayload: string = `${remoteTimestamp}.${JSON.stringify(requestBody)}`

    try {
        const secret = await getWebhookSecret(ThirdPartyService.Podium, event)
        const localSignature = createHmac('sha256', secret || "").update(signedPayload).digest('hex')

        // console.log(secret)
        // console.log(remoteSignature)        

        return new Promise((resolve) => resolve(localSignature === remoteSignature))

    } catch (error) {
        console.error("ERROR: Could not verify webhook signature")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}