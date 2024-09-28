import { ValidContactType } from "../controllers/GeneralContactsController/model/ValidContactType"
import { GeneralContactTags } from "./GeneralContactTags"
import { ThirdPartyService, ThirdPartyServiceMap } from "./ThirdPartyService"

// TODO -- Needs to mirror Contact table DDL
export type GeneralContact = {
    id?: number,
    first_name?: string,
    last_name?: string,
    tags: GeneralContactTags,
    emails: string[],
    address: string[],
    phone_numbers: string[],
    original_service: ThirdPartyService,
    original_contact_object: ValidContactType,
    synced_with_service: ThirdPartyServiceMap<boolean>,
    created_at: Date,
    updated_at: Date,
    service_ids: ThirdPartyServiceMap<string>,
    birthdate: Date,
}

export enum GeneralContactField {
    id = "id",
    first_name = "first_name",
    last_name = "last_name",
    tags = "tags",
    emails = "emails",
    address = "address",
    phone_numbers = "phone_numbers",
    original_service = "original_service",
    original_contact_object = "original_contact_object",
    syncedWithService = "syncedWithService",
    created_at = "created_at",
    updated_at = "updated_at",
    service_ids = "service_ids",
    birthdate = "birthdate",
}