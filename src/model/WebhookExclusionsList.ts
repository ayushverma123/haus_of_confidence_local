import { WebhookTypeMap } from "../WebhookType";
import { ThirdPartyServiceMap } from "./ThirdPartyService";

export type WebhookExclusionsList = ThirdPartyServiceMap<WebhookTypeMap<boolean>>