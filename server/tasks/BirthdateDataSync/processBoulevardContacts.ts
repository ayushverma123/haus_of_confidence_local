import { Client } from "../../ThirdPartyServices/Blvd/model/Client"
import { updateGeneralContactBirthdateValue } from "../../controllers/GeneralContactsController"
import { andReduction } from "../../helpers/ArrayFunctions"
import { GeneralContact } from "../../model/GeneralContact"
import { ServiceContactProcessingFunction } from "./model/ServiceContactProcessingFunction"

const processBoulevardContactBirthdays: ServiceContactProcessingFunction = async (contacts: GeneralContact[]): Promise<boolean> => {
    // This one is easy
    // Inspect each original_contact_object, looking for the dob property. If it exists, update that contacts birthdate column with the dob value.

    //@ts-ignore
    const results: boolean[] = await contacts.reduce(async (acc: Promise<boolean[]>, contact: GeneralContact): Promise<boolean[]> => {
        const existing = await acc
        const { original_contact_object, id } = contact
        const { dob } = original_contact_object as Client


        if (typeof(id) === "undefined" || Object.is(id, null)) {
            throw new Error("Could not find id for contact")
        }

        if (typeof(dob) === 'undefined' || Object.is(dob, null) || (dob ?? '').length <= 0) {
            return new Promise((resolve) => resolve(existing))
        }
        
        const contactBirthdate = new Date(dob)

        try {
            const result = await updateGeneralContactBirthdateValue(`${id}`, contactBirthdate)

            return [...existing, result]

        } catch (error) {
            console.error(`Error processing ${contact.original_service.toUpperCase()} contact birthday for GeneralContact ID: ${contact.id!}`)
            console.error(error)

            return new Promise((resolve) => resolve([...existing, false]))
        }
        
    }, [])

    console.log("RESULTS")
    console.log(results)

    return new Promise((resolve) => resolve(andReduction(results)))
}

export default processBoulevardContactBirthdays