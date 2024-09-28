import { Client } from "../../ThirdPartyServices/Blvd/model/Client";
import { Contact } from "../../ThirdPartyServices/Podium/model/Contact";
import { ContactAttribute } from "../../ThirdPartyServices/Podium/model/ContactAttribute";
import { GeneralContact } from "../../model/GeneralContact";
import { Maybe } from "../../model/Maybe";
import { ThirdPartyService, thirdPartyServiceFromLowercaseServiceName } from "../../model/ThirdPartyService";
import { parseISO } from "date-fns";

export const getGeneralContactDateOfBirth = async (contact: GeneralContact): Promise<Maybe<Date>> => {
    const { original_service: _original_service, original_contact_object, birthdate } = contact

    const original_service = thirdPartyServiceFromLowercaseServiceName[_original_service]

    console.log("TRYING TO GET DATE OF BIRTH FOR CONTACT:", contact.id)
    console.log("ORIGINAL SERVICE:", original_service)

    try {

        // const returnMap: {[key in ThirdPartyService]: () => Maybe<Date>} = {
        //     [ThirdPartyService.Boulevard]: () => {
        //         const contactObject: Client = original_contact_object as Client

        //         const { dob } = contactObject

        //         if (typeof(dob) === 'undefined' || Object.is(dob, null)) return undefined

        //         return parseISO(dob!) 
        //     },
        //     [ThirdPartyService.Podium]: () => {
        //         const contactObject: Contact = original_contact_object as Contact

        //         const label = 'Birthday'

        //         const { attributes } = contactObject
                
        //         const dobAttribute: Maybe<ContactAttribute> = attributes.find(attribute => attribute.label === label)

        //         console.log("DOB ATTRIBUTE:", dobAttribute)

        //         if (typeof(dobAttribute) === 'undefined' || Object.is(dobAttribute, null)) return undefined
        //         if (typeof(dobAttribute!.value) === 'undefined' || Object.is(dobAttribute!.value, null)) return undefined

        //         return parseISO(dobAttribute!.value) 

        //     }, 
        //     [ThirdPartyService.GoHighLevel]: () => {
        //         throw new Error("Not implemented")
        //     }
        // }

        // const result = returnMap[original_service]()
        const hasBirthdate = typeof(birthdate) !== 'undefined' && !Object.is(birthdate, null)
        return new Promise((resolve) => resolve(hasBirthdate ? birthdate : undefined))

    } catch (error) {
        console.error(`Failed to get General Contact Date of Birth: ${contact.id}`)
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}