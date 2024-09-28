import { ThirdPartyService, ThirdPartyServiceMap } from "../../../model/ThirdPartyService";
import { WebhookType } from "./WebhookType";
import { boulevardEventTypeToEventType } from "./boulevard/BoulevardEventTypeToEventType";
import { WebhookResponseItem as BoulevardWebhookObject } from "./boulevard/ListWebhooksResponse";
import { WebhookObject as PodiumWebhookObject } from "./podium/WebhookObject";

export type GeneralWebhookObject = {
    service: ThirdPartyService,
    type: WebhookType,
    createdAt: string,
    enabled: boolean,
    url: string,
    secret?: string,
    locationUid?: string,
    updatedAt: string,
    organizationUid?: string,
    uid: string
}


export const convertServiceWebhookObjectToGeneralWebhookObject = (service: ThirdPartyService, event: WebhookType, webhookObject: any): GeneralWebhookObject => {
    const serviceMap: ThirdPartyServiceMap<() => GeneralWebhookObject> = {
        [ThirdPartyService.Boulevard]: (): GeneralWebhookObject => {
            const { createdAt, updatedAt, id, name, url, subscriptions } = webhookObject as BoulevardWebhookObject
            const { enabled, eventType, id: subId } = subscriptions[0]

            return {
                service,
                type: event,
                createdAt: `${createdAt}`,
                updatedAt: `${updatedAt}`,
                enabled: enabled,
                url: url,
                uid: id
            }
        },
        [ThirdPartyService.Podium]: (): GeneralWebhookObject => {
            const podiumWebhookObject = webhookObject as PodiumWebhookObject

            return {
                    service: service,
                    type: event,
                    createdAt: podiumWebhookObject.createdAt,
                    enabled: !podiumWebhookObject.disabled,
                    url: podiumWebhookObject.url,
                    secret: podiumWebhookObject.secret,
                    locationUid: podiumWebhookObject.locationUid,
                    updatedAt: podiumWebhookObject.updatedAt,
                    organizationUid: podiumWebhookObject.organizationUid,
                    uid: podiumWebhookObject.uid
                }
        },
        [ThirdPartyService.GoHighLevel]: (): GeneralWebhookObject => {
            throw new Error("Not implemented")
        }
    }
    
    return serviceMap[service]()
}

