import { Organization } from "./Organization"

export type ContactTag = {
    createdAt: string,
    description: string,
    label: string,
    organization: {
        uid: string
    },
    uid: string,
    updatedAt: string
}