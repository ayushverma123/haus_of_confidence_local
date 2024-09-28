import { Tag } from "../Tag"
import { DataNodeCommon } from "./DataNodeCommon"

export type ClientWebhookData = DataNodeCommon & {
    active: boolean,
    appointmentCount: number,
    createdAt: string,
    dob: string | null,
    email: string | null,
    externalId: string | null,
    firstName: string | null,
    id: string,
    lastName: string | null,
    mergedIntoClientId: string | null,
    mobilePhone: string | null,
    name: string | null,
    tags: Tag[],
    updatedAt: string
}