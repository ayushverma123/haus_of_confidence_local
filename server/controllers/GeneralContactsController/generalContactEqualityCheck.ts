import { andReduction } from "../../helpers/ArrayFunctions"
import { GeneralContact } from "../../model/GeneralContact"
import { Maybe } from "../../model/Maybe"
import { ContactEqualityType } from "./model/ContactEqualityType"

export const generalContactEqualityCheck = async (leftContact: GeneralContact, rightContact: GeneralContact, comparisonType: ContactEqualityType): Promise<boolean> => {
    interface EqualityContactFields { 
        first_name?: string,
        last_name?: string,
        emails: string[],
        phone_numbers: string[]
    } 

    // console.log("LEFT CONTACT")
    // console.log(leftContact)

    // console.log("RIGHT CONTACT")
    // console.log(rightContact)

    enum _field {
        firstName = "first_name",
        lastName = "last_name",
        emails = "emails",
        phoneNumbers = "phone_numbers"
    }

    // const { first_name: l_first_name, last_name: l_last_name, emails: l_emails, phone_numbers: l_phone_numbers }: EqualityContactFields = leftContact
    // const { first_name: r_first_name, last_name: r_last_name, emails: r_emails, phone_numbers: r_phone_numbers }: EqualityContactFields = rightContact

    const getFirstArrayValue = <T,>(array: T[]): Maybe<T> => array.length > 0 ? array[0]: undefined

    const getValue: {[key in _field]: (contact: GeneralContact) => Maybe<string>} = {
        [_field.firstName]: (contact) => contact.first_name,
        [_field.lastName]: (contact) => contact.last_name,
        [_field.emails]: (contact) => getFirstArrayValue(contact.emails),
        [_field.phoneNumbers]: (contact) => getFirstArrayValue(contact.phone_numbers)
    }

    const equalityTypeCheck: {[key in ContactEqualityType]: () => boolean} = {
        //@ts-expect-error
        [ContactEqualityType.Exact]: (): boolean => {

        },

        [ContactEqualityType.Fuzzy]: (): boolean => {

            //@ts-ignore
            const resultsArray: boolean[] = Object.values(_field).reduce((existingResults: boolean[], fieldKey: string): boolean[] => {
                // const fieldEnum: _field = _field[fieldKey]

                // console.log("FIELD KEY:", fieldKey)

                const value = (contact: GeneralContact) => getValue[fieldKey](contact)

                const left = value(leftContact)
                const right = value(rightContact)

                if (typeof(left) === "undefined" || typeof(right) === "undefined") {
                        // return [
                        //     ...existingResults, 
                        //     typeof(left) === "undefined" && typeof(right) === "undefined"
                        // ]

                        return existingResults
                }
                
                const values: [string, string] = [left.toLowerCase(), right.toLowerCase()]

                // if (leftContact.original_contact_object['id'] === 'urn:blvd:Client:3e1751d6-9586-4942-b510-7119e2099ad4') {
                // if ((leftContact.first_name === 'Charles' && leftContact.last_name === 'Onwuhai') || (rightContact.first_name === 'Charles' && rightContact.last_name === 'Onwuhai')) {
                //     // console.group(`${fieldKey}: LEFT VALUE = ${values[0]}`)
                //     // console.log(`${fieldKey}: RIGHT VALUE = ${values[1]}`)
                //     // console.log(values[0] === values[1])
                //     // console.groupEnd()
                //     if (values[0] === values[1]) {
                //         console.group(`${fieldKey}: LEFT VALUE = ${values[0]}`)
                //         console.log(`${fieldKey}: RIGHT VALUE = ${values[1]}`)
                //         console.log(`LEFT CONTACT NAME: ${leftContact.first_name} ${leftContact.last_name}`)
                //         console.log(`RIGHT CONTACT NAME: ${rightContact.first_name} ${rightContact.last_name}`)
                //     }
                // }

                const areValuesEqual: boolean = values[0] === values[1]
                
                return [
                    ...existingResults,
                    areValuesEqual
                ]
            }, [])

            const nameEqual = andReduction([resultsArray[0], resultsArray[1]])
            const emailEqual = resultsArray[2]            
            const phoneEqual = resultsArray[3]

            // if ((phoneEqual || emailEqual)) {
            // console.group("LEFT CONTACT")
            //         console.log(leftContact)
            //     console.groupEnd()

            //     console.group("RIGHT CONTACT")
            //     console.log(rightContact)
            // console.groupEnd()
            // }

            // if (leftContact.original_contact_object['id'] === 'urn:blvd:Client:3e1751d6-9586-4942-b510-7119e2099ad4') {
            //     console.log("Email equal?", emailEqual)
            //     console.log("phone equal?", phoneEqual)
            // }

            // return andReduction(resultsArray)
            // return (nameEqual) || (emailEqual) || (phoneEqual)

            // const isMatch = (phoneEqual && emailEqual) || (phoneEqual && nameEqual) || phoneEqual || emailEqual
            
            // if (isMatch) {
            //     console.log("LEFT CONTACT")
            //     console.log(leftContact)

            //     console.log("RIGHT CONTACT")
            //     console.log(rightContact)
            // }

            return (phoneEqual && emailEqual) || (phoneEqual && nameEqual) || phoneEqual || emailEqual
        }
    }

    return equalityTypeCheck[comparisonType]()
}