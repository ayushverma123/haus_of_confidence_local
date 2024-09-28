import { Business } from "../Business";
import { LocationSettings } from "./LocationSettings";
import { LocationSocials } from "./LocationSocials";

export type Location = {
    id: string,
    companyId: string,
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    logoUrl: string,
    website: string,
    timezone: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    business: Business, //TODO
    social: LocationSocials, // TODO
    settings: LocationSettings, // TODO
    reseller: object,
}
