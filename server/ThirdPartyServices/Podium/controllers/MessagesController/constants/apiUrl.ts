import { serviceEndpoint } from "../../../../../constants/endpoints";
import { EndpointType } from "../../../../../model/EndpointType";
import { ThirdPartyService } from "../../../../../model/ThirdPartyService";

export default `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/messages`