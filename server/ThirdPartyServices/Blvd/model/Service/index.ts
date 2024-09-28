import { Id } from "../Id";
import { NativeObjectMeta } from "../NativeObjectMeta";
import { ServiceCategory } from "./ServiceCategory";
import { ServiceOptionGroup } from "./ServiceOptionGroup";

export interface Service {
    active: boolean,
    addon: boolean,
    category: ServiceCategory,
    categoryId: Id,
    createdAt: string,
    custom: NativeObjectMeta,
    customFields: {[key: string]: string},
    defaultDuration: number,
    defaultPrice: number,
    description?: string,
    externalId?: string,
    id: Id,
    name: string,
    serviceOptionGroups: Array<ServiceOptionGroup>,
    updatedAt: string,
}