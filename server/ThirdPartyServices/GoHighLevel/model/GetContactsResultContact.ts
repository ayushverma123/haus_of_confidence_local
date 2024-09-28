import { ContactAttribution } from "./Contact/ContactAttribution"
import { CustomField } from "./CustomField"

export type GetContactsResultContact = {
    id: string,
    locationId: string,
    email: string,
    timezone: string,
    country: string,
    source: string,
    dateAdded: string,
    customFields: Array<CustomField>,
    tags: Array<string>,
    businessId: string,
    attributions: Array<ContactAttribution> ,
}

