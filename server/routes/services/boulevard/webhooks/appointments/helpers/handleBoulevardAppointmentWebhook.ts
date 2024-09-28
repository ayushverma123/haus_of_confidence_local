import { Appointment } from "../../../../../../ThirdPartyServices/Blvd/model/Appointment";
import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData";
import { caseSensitiveSkipMessage, skipMessagingString } from "../../../../../../ThirdPartyServices/Podium/controllers/MessagesController/constants/skipMessagingString";
import { processAutomatedMessageConfigurationEntry } from "../../../../../../controllers/AutomatedMessagesController/configurationProcessor";
import { generateDataObject } from "../../../../../../controllers/AutomatedMessagesController/configurationProcessor/dataObjectGenerator";
import { AutomatedMessageConfigurationEntry } from "../../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry";
import { AutomatedMessageTrigger } from "../../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger";
import { createNewAppointmentRow } from "../../../../../../controllers/BoulevardAppointmentsTableController/createNewAppointmentRow";
import { getDatabaseAppointmentWithAppointmentId } from "../../../../../../controllers/BoulevardAppointmentsTableController/getDatabaseAppointmentWithAppointmentId";
import { BoulevardAppointmentsTableRow } from "../../../../../../controllers/BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { updateAppointmentObject } from "../../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentObject";
import { Maybe } from "../../../../../../model/Maybe";
import { getStandardWebhookData } from "../../common";
import { checkForAutomatedMessageConfigurationsForTrigger } from "./checkForAutomatedMessageConfigurationsForTrigger";
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./checkForClientInGeneralContactsAndCreateIfNonExistant";
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./verifyAndRetrieveAppointmentFromBoulevardServer";

export type HandleBoulevardAppointmentWebhookReturn = {
    contactCreated: boolean,
    generalContactId: number,
    appointment: Appointment,
    hasAutomatedMessages: boolean,
    automatedMessages: AutomatedMessageConfigurationEntry[],
    results: boolean[],
    appointmentRowId: number
}


export const handleBoulevardAppointmentWebhook = async (reqBody: any, messageTrigger: AutomatedMessageTrigger): Promise<HandleBoulevardAppointmentWebhookReturn> => {
    const { data: originalAppointment } = getStandardWebhookData<AppointmentWebhookEvent, AppointmentWebhookData>(reqBody)
    // Get client ID so we know who this is for
    const { clientId, id: appointmentId, notes } = originalAppointment

    console.group("REQUEST DATA FOR", messageTrigger)
    console.log(reqBody)
    console.groupEnd()

    const typeIsCancellation = messageTrigger === AutomatedMessageTrigger.BoulevardAppointmentCancelled

    const hasNotes = (() => {
        if (typeof(notes) === 'undefined' || Object.is(notes, null)) return false
        if (notes!.length <= 0) return false
        return true
    }) 

    const notesHasNoMessageString = hasNotes() ? (caseSensitiveSkipMessage ? notes! : notes!.toLowerCase()).includes(( caseSensitiveSkipMessage ? skipMessagingString : skipMessagingString.toLowerCase())) : false
    // const shouldCreateNewAppointmentRowMap: {[key in WebhookType]: boolean} = {
    //     [WebhookType.AppointmentCreated]: true,
    //     [WebhookType.AppointmentUpdated]: false,
    //     [WebhookType.AppointmentCancelled]: false,
    //     [WebhookType.AppointmentCompleted]: false,
    //     [WebhookType.AppointmentRescheduled]: false,
    //     [WebhookType.AppointmentActive]: false,
    //     [WebhookType.AppointmentConfirmed]: false,
    //     [WebhookType.AppointmentArrived]: false,
    //     [WebhookType.ContactCreated]: false,
    //     [WebhookType.ContactDeleted]: false,
    // }

    const shouldCreateNewAppointmentRowTriggers: AutomatedMessageTrigger[] = [
        AutomatedMessageTrigger.BoulevardAppointmentCreated
    ]

    const existingDatabaseAppointment: Maybe<BoulevardAppointmentsTableRow> = await getDatabaseAppointmentWithAppointmentId(appointmentId)

    const shouldCreateNewAppointmentRow: boolean = typeof(existingDatabaseAppointment) === 'undefined' // ||  (shouldCreateNewAppointmentRowTriggers.includes(messageTrigger) && typeof(existingDatabaseAppointment) === 'undefined')


    try {
        
        const { contactCreated, generalContactId } = await checkForClientInGeneralContactsAndCreateIfNonExistant(clientId)

        if (contactCreated) {
            //? Now need to check if Podium already has this contact.
            //? Is it even possible for this part of the code to even run though? Like will these conditions ever actually occur?
            // TODO -- Also, move this part and the part above into yet another wrapper function that can be called from all the appointments webhooks
        }

        const appointment = await verifyAndRetrieveAppointmentFromBoulevardServer(appointmentId)

        // Check for automated messaging configuration for AppointmentCreated
        const { hasAutomatedMessages, automatedMessages } = await checkForAutomatedMessageConfigurationsForTrigger(messageTrigger)

        let appointmentRowId
        try {
            if (shouldCreateNewAppointmentRow) {
                appointmentRowId = await createNewAppointmentRow(generalContactId!, appointmentId, appointment)
            } else {
                appointmentRowId = existingDatabaseAppointment.id //await getDatabaseAppointmentWithAppointmentId(appointmentId)

                await updateAppointmentObject(appointmentRowId, appointment)
            }
        } catch (error) {
            console.error(`Unable to create new / update existing appointment row for Boulevard appointment ${appointmentId}`)
            console.error(error)
        }

        let results: boolean[]
        // If there are automated messages and there isn't a NoMessage string, send them a message
        if (hasAutomatedMessages && !notesHasNoMessageString) {
            //@ts-ignore
            results = await automatedMessages.reduce(async (acc: Promise<boolean[]>, entry: AutomatedMessageConfigurationEntry): Promise<boolean[]> => {
                const existing = await acc

                try {
                    await processAutomatedMessageConfigurationEntry(entry, await generateDataObject(appointmentId, `${generalContactId}`))

                    return new Promise((resolve) => resolve([ ...existing, true ]))
                } catch (error) {
                    console.error(`Error processing the automated message configuration ${entry.id}`)
                    console.error(error)

                    return new Promise((resolve) => resolve([...existing, false ]))
                }
            }, [])
        }

        return new Promise((resolve) => resolve({
            contactCreated,
            generalContactId,
            appointment,
            hasAutomatedMessages,
            automatedMessages,
            results,
            appointmentRowId
        }))

    } catch (error) {
        console.error(`Failed to process ${messageTrigger} appointment webhook for Boulevard`)
        return new Promise((_, reject) => reject(error))
    } 
}