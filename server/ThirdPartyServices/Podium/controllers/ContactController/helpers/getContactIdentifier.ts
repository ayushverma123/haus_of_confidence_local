import { Maybe } from "../../../../../model/Maybe"
import { Contact } from "../../../model/Contact"
import emptyName from '../../../../../constants/emptyName'

export const getContactIdentifier = (contact: Contact): string => {
    if (typeof(contact) === 'undefined' || Object.is(contact, null)) {
        throw new Error('Contact object is undefined')
    }

    const { phoneNumbers, emails } = contact
    const name: Maybe<string> | null = contact.name
    


    //? Priority is: Phone numbers -> Emails -> Name -> Nothing
    if (typeof(phoneNumbers) !== 'undefined' && !Object.is(phoneNumbers, null))  {
        if (phoneNumbers.length > 0) {
            if (phoneNumbers[0].length > 0) return `${phoneNumbers[0]}`
        }
    }

    if (typeof(emails) !== 'undefined' && !Object.is(emails, null))  {
        if (emails.length > 0) {
            if (emails[0].length > 0) return `${emails[0]}`
        }
    }

    if (typeof(name) !== 'undefined' && !Object.is(name, null)) {
        if (name.length > 0 && name !== emptyName ) return `${name}`
    }

    console.error(`Could not determine contact identifier in contact, cannot find phone number, email or name`)
    
    console.error(contact)
    throw new Error(`Unable to determine contact identifier in contact`)
}