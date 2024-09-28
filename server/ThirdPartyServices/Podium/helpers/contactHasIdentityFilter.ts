import { Contact } from "../model/Contact"

export const contactHasIdentityFilter = (contact: Contact) => {
    const { name, emails, phoneNumbers } = contact
    
    const hasEmails = (() => {
        if (typeof(emails) === 'undefined') return false
        if (Object.is(emails, null)) return false
        if (emails.length === 0) return false
        return true
    })()

    const hasPhoneNumbers = (() => {
        if (typeof(phoneNumbers) === 'undefined') return false
        if (Object.is(phoneNumbers, null)) return false
        if (phoneNumbers.length === 0) return false
        return true
    })()

    const hasName = (() => {
        if (typeof(name) === 'undefined') return false
        if (Object.is(name, null)) return false
        if (name.length === 0) return false
        return true
    })()

    return hasEmails || hasPhoneNumbers || hasName
}