import { ThirdPartyServiceMap } from "../../../model/ThirdPartyService";
import { WebhookType, WebhookTypeMap } from "../model/WebhookType";

export type WebhookReceiverEndpointObject = ThirdPartyServiceMap<WebhookTypeMap<string>>