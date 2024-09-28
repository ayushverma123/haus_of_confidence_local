import { convertThirdPartyContactToGeneralContact, getGeneralContactPrimaryKeyWithServiceContactId } from "../../../../../../controllers/GeneralContactsController"
import { secondsToMilliseconds } from "../../../../../../helpers/UnitConversions"
import { Wait } from "../../../../../../helpers/Wait"
import { Maybe } from "../../../../../../model/Maybe"
import { ThirdPartyService } from "../../../../../../model/ThirdPartyService"

export type CheckForClientInGeneralContactsOutput = {
    contactCreated: boolean,
    generalContactId: number,
}

export const checkForClientInGeneralContactsAndCreateIfNonExistant = async (clientId: string): Promise<CheckForClientInGeneralContactsOutput> => {
    const maxContactIdAttempts: number = 3
    const maxCreateClientAttempts: number = 3
    const totalMaxAttempts: number = maxContactIdAttempts + maxCreateClientAttempts

    const doNotCreate: boolean = true

    var currentAttemptNumber: number = 1
    
    var contactId: Maybe<string> = undefined
    
    let contactCreated: boolean

    if (doNotCreate) {
        contactId = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Boulevard, clientId as string)

    } else {
        do {
            await Wait(secondsToMilliseconds(1))
    
            const overMaxContactIdAttempts: boolean = currentAttemptNumber > maxContactIdAttempts
            var newClientId: Maybe<string>
            
            if (overMaxContactIdAttempts) {
                // // TODO -- Needs to create a new general contact with Boulevard as the original source
                // // TODO --      and assign a contactId
                // const _contactId = // TODO
                // if (typeof(_contactId) !== 'undefined') {
                //     contactCreated = true
                //     contactId = _contactId
                // }
                //! Right now, I don't think this issue is even possible
    
                currentAttemptNumber = totalMaxAttempts + 1
    
            } else {
                contactId = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Boulevard, overMaxContactIdAttempts ? newClientId! : clientId as string)
            }
    
            currentAttemptNumber += 1
        } while (typeof(contactId) === 'undefined' || currentAttemptNumber <= totalMaxAttempts)
    }
    
    if (typeof(contactId) === 'undefined') {
        return new Promise((_, reject) => reject(
            doNotCreate ? new Error(`Unable to find contact ID for incoming appointment with client ID ${clientId}` ) 
            : new Error(`Unable to find contact ID for incoming appointment with client ID ${clientId}, and unable to create a new general contact with the aformentioned client's information after ${totalMaxAttempts} attempts`)
        ))
    }

    return new Promise((resolve) => resolve({
        contactCreated: contactCreated ?? false,  
        generalContactId: parseInt(contactId!)
    }))
}