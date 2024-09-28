import { secondsToMilliseconds } from "date-fns"
import { getBirthdateAttributeId } from "../../ThirdPartyServices/Podium/controllers/ContactAttributesController/StateManager"
import { getContactWithPhoneEmailOrConvoUid } from "../../ThirdPartyServices/Podium/controllers/ContactController"
import { Contact } from "../../ThirdPartyServices/Podium/model/Contact"
import { GeneralContact } from "../../model/GeneralContact"
import { Maybe } from "../../model/Maybe"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { ServiceContactProcessingFunction } from "./model/ServiceContactProcessingFunction"
import { Wait } from "../../helpers/Wait"
import getContactBirthdate from "../../ThirdPartyServices/Podium/helpers/getContactBirthdate"
import { updateGeneralContactBirthdateValue } from "../../controllers/GeneralContactsController"
import { andReduction } from "../../helpers/ArrayFunctions"

const processPodiumContactBirthdays: ServiceContactProcessingFunction = async (contacts: GeneralContact[]): Promise<boolean> => {

    return new Promise((resolve) => resolve(true))
    
    // Get the birthdate attribute ID
    const birthdateAttributeId = await getBirthdateAttributeId()

    // For each contact, use the Podium service ID to retrieve the remote contact object
    // then use getContactBirthdate with that contact and birthdateAttributeId to get the contact birthdate
    // TODO -- Finally, update the contact's birthdate with the remote contact's birthdate attribute value

    const syncResults = await contacts.reduce(async (acc: Promise<boolean[]>, contact: GeneralContact, index: number): Promise<boolean[]> => {
        const { id: contactId } = contact

        console.log("PODIUM CONTACT")
        console.log(contact)

        if (index > 0) await Wait(secondsToMilliseconds(1))

        const existing = await acc
        
        const podiumUid: Maybe<string> = contact.service_ids[ThirdPartyService.Podium]

        if (typeof(podiumUid) === "undefined" || Object.is(podiumUid, null) || (podiumUid ?? '').length <= 0) { 
            throw new Error("No Podium UID found for contact " + contact.id)
            // return new Promise((resolve) => resolve(existing))
        }

        try {
            const remoteContact: Maybe<Contact> = await getContactWithPhoneEmailOrConvoUid(podiumUid)

            if (typeof(remoteContact) === "undefined" || Object.is(remoteContact, null)) {
                throw new Error("No remote contact found for Podium UID " + podiumUid)
                // return new Promise((resolve) => resolve(existing))
            }

            const contactBirthdate: Maybe<Date> = await getContactBirthdate(remoteContact, birthdateAttributeId)

            if (typeof(contactBirthdate) === "undefined" || Object.is(contactBirthdate,null)) {
                return new Promise((resolve) => resolve(existing))
            }

            await updateGeneralContactBirthdateValue(`${contactId}`, contactBirthdate)

            return new Promise((resolve) => resolve([...existing, true]))

        } catch (error) {
            console.error(`Error processing Podium contact with GeneralContact ID: ${contact.id ?? '(N/A)'}`)
            console.error(error)

            return new Promise((resolve) => resolve([...existing, false]))
        }

    }, new Promise((resolve) => resolve([])))

    console.log(syncResults)

    return new Promise((resolve) => resolve(andReduction(syncResults)))
}

export default processPodiumContactBirthdays