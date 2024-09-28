export enum ThirdPartyService {
    Boulevard = "Boulevard",
    Podium = "Podium",
    GoHighLevel = "GoHighLevel",
}

export type ThirdPartyServiceMap<T,> = {[key in ThirdPartyService]: T}

export const thirdPartyServiceFromLowercaseServiceName: {[key: string]: ThirdPartyService} = {
    'boulevard': ThirdPartyService.Boulevard,
    'podium': ThirdPartyService.Podium,
    'gohighlevel': ThirdPartyService.GoHighLevel,
}    
