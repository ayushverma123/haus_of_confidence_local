import { ContactAttribute } from "./ContactAttribute";
import { Conversation } from "./Conversation";
import { Organization } from "./Organization";
import { ContactObjectTag } from "./ContactObjectTag";

export type Contact = {
    attributes: ContactAttribute[],
    conversations: Conversation[],
    createdAt: string,
    emails: string[],
    locations: Location[],
    name: string, //! DATETIME
    organization: Organization[],
    phoneNumbers: string[],
    tags: ContactObjectTag[],
    uid: string,
    updatedAt: string, //! DATETIME
}


