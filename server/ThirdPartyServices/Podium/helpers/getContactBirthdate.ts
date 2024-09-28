import { Maybe } from "../../../model/Maybe"
import { Contact } from "../model/Contact"

const getContactBirthdate = (contact: Contact, birthdateAttributeId): Maybe<Date> => {
    const attributes = contact.attributes

    if (attributes.length === 0) {
        return undefined
    }
    
    console.log(attributes)

    try {
        const birthdateAttribute = attributes.find(({ uid }) =>  uid === birthdateAttributeId)?.value

        if (typeof(birthdateAttribute) === 'undefined' || Object.is(undefined, birthdateAttribute) || (birthdateAttribute ?? '').length <= 0) {
            return undefined
        }

        return new Date(birthdateAttribute!)

    } catch (error) {
        console.error(`Error getting birthdate attribute from contact ID ${contact.uid!}`)
        console.error(error)

        return undefined
    }
}

export default getContactBirthdate