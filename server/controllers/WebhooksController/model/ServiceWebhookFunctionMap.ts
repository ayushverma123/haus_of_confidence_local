import { ThirdPartyService, ThirdPartyServiceMap } from "../../../model/ThirdPartyService";
import { WebhookType, WebhookTypeMap } from "./WebhookType";
import { WebhookRegistrationResponse } from "./WebhookRegistrationResponse";

export type ServiceWebhookFunctionMap<T,> = ThirdPartyServiceMap<WebhookTypeMap<() => Promise<T>>>