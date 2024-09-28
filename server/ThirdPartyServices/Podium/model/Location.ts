import { AddressDetails } from "./AddressDetails"

export type Location = {
    address: string,
    addressDetails: AddressDetails,
    archived: boolean,
    archivedAt: string,
    createdAt: string,
    displayName: string,
    name: string,
    organizationUid: string,
    phoneNumber: string,
    podiumPhoneNumber: string,
    uid: string,
    updatedAt: string
}