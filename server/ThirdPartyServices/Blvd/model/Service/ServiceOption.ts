import { Id } from "../Id";

export interface ServiceOption {
    defaultDurationDelta: number,
    defaultFinishDurationDelta: number,
    defaultPostClientDurationDelta: number,
    defaultPostStartDurationDelta: number,
    defaultPriceDelta: number,
    description?: string,
    id: Id,
    name: string,
    serviceOptionGroupId: Id,
    sortPath: any
}