import { Id } from "../Id";
import { ServiceOption } from "./ServiceOption";

export interface ServiceOptionGroup {
    description?: string,
    id: Id,
    maxLimit?: number,
    minLimit?: number,
    name: string,
    serviceId: Id,
    serviceOptions: Array<ServiceOption>,
    sortPath: any
}