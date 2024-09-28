import { ThirdPartyService, ThirdPartyServiceMap } from "../model/ThirdPartyService";

export const thirdPartyServiceContactIdKey: ThirdPartyServiceMap<string> = {
    [ThirdPartyService.Boulevard]: 'id',
    [ThirdPartyService.Podium]: 'uid',
    [ThirdPartyService.GoHighLevel]: 'id',
}