import { ThirdPartyServiceMap } from "../../../model/ThirdPartyService";
import { WebhookTypeMap } from "./WebhookType";

export type WebhookExclusionsList = ThirdPartyServiceMap<WebhookTypeMap<boolean>>