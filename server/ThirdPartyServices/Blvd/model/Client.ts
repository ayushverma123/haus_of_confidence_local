import { CreditCard } from "./CreditCard"
import { Id } from "./Id"
import { Location } from "./Location"
import { MarketingSetting } from "./MarketingSetting"
import { Note } from "./Note"
import { ReminderSetting } from "./ReminderSetting"
import { Tag } from "./Tag"

export type Client = {
    active: boolean,
    appointmentCount: number,
    createdAt: string, //! DATETIME
    creditCardsOnFile: CreditCard[],
    custom?: any, // TODO, maybe
    customFields: {[key: string]: string},
    dob?: string, //! DATE
    email?: string,
    externalId?: string,
    firstName?: string,
    hasCardOnFile: boolean,
    id: Id,
    lastName?: string,
    marketingSettings: MarketingSetting[],
    mergedIntoClientId?: Id,
    mobilePhone?: string,
    name?: string,
    notes: Note[],
    primaryLocation?: Location,
    pronoun?: string,
    reminderSettings: ReminderSetting[],
    tags: Tag[],
    updatedAt: string //! DATETIME
}

export const graphQlBody: string = `
    active
    appointmentCount
    createdAt
    dob
    email
    externalId
    firstName
    id
    lastName
    mergedIntoClientId
    mobilePhone
    name
    notes {
        createdAt
        id
        insertedAt
        text
    }
    primaryLocation {
        address {
            city
            country
            line1
            line2
            province
            state
            zip
        }
        businessName
    }
    pronoun
    tags {
        id
        name
        symbol
    }
    updatedAt
`