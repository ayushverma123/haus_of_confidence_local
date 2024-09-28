import { isSandbox as ghlIsSandbox } from "../ThirdPartyServices/GoHighLevel/constants/isSandbox";
import { checkEnvBooleanValue } from "../helpers/envFunctions";
import { EndpointType } from "../model/EndpointType";
import { ThirdPartyService, ThirdPartyServiceMap} from "../model/ThirdPartyService";

const blvdIsSandbox: boolean = checkEnvBooleanValue(process.env.BLVD_SANDBOX)

export const serviceEndpoint : ThirdPartyServiceMap<{[key in EndpointType] : string}> = 
    {
        [ThirdPartyService.Boulevard]: {
            [EndpointType.AdminAPI]: blvdIsSandbox ? 
                "https://sandbox.joinblvd.com/api/2020-01/admin" 
                : "https://dashboard.boulevard.io/api/2020-01/admin",
            [EndpointType.Authentication]: "",
            [EndpointType.ClientAPI]: ""
        },

        [ThirdPartyService.Podium]: {
            [EndpointType.AdminAPI]: "https://api.podium.com/v4",
            [EndpointType.Authentication]: "https://api.podium.com/oauth",
            [EndpointType.ClientAPI]: ""
        },

        // TODO
        [ThirdPartyService.GoHighLevel]: {
            [EndpointType.AdminAPI]:ghlIsSandbox ? 
                "https://stoplight.io/mocks/highlevel/integrations/" 
                : "https://services.leadconnectorhq.com/",
            [EndpointType.Authentication]: ghlIsSandbox ? 
                "https://stoplight.io/mocks/highlevel/integrations/39582851/oauth" 
                : "https://services.leadconnectorhq.com/oauth",
            [EndpointType.ClientAPI]: ""
        }
    }

