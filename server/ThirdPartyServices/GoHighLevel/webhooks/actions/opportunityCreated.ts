import { Maybe } from "graphql/jsutils/Maybe";
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow";
import { Contact } from "../../model/Contact";
import { Opportunity } from "../../model/Opportunity";
import { OpportunityCreateEventData } from "../model/OpportunityCreateEventData";
import { getContactWithId } from "../../controllers/ContactController/getContactWithId";
import { getOpportunityWithId } from "../../controllers/OpportunityController/getOpportunityWithId";
import { createNewGHLOpportunityRow } from "../../../../controllers/GHLOpportunitiesController/createNewGHLOpportunityRow";
import { OpportunityStatusFromString } from "../../model/Opportunity/OpportunityStatus";
import { GeneralContact } from "../../../../model/GeneralContact";
import { convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithPrimaryKey, storeGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../../../../controllers/GeneralContactsController";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { findGeneralContact } from "../../../../controllers/GeneralContactsController/findGeneralContact";
import { syncContactToService } from "../../../../controllers/GeneralContactsController/syncContactToService";
import { Contact as PodiumContact } from '../../../Podium/model/Contact'
import { updateGHLOpportunityRow } from "../../../../controllers/GHLOpportunitiesController/updateGHLOpportunityRow";
import { checkForAutomatedMessageConfigurationsForTrigger } from "../../../../routes/services/boulevard/webhooks/appointments/helpers/checkForAutomatedMessageConfigurationsForTrigger";
import { AutomatedMessageTrigger } from "../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger";
import { processAutomatedMessageConfigurationEntry } from "../../../../controllers/AutomatedMessagesController/configurationProcessor";
import { generateDataObject } from "../../../../controllers/AutomatedMessagesController/configurationProcessor/dataObjectGenerator";
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue";
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue";
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController";
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate";

export const opportunityCreated = async (queueEntry: WebhooksQueueTableRow<OpportunityCreateEventData>): Promise<boolean> => {
       // throw new Error('Opportunity Created Webhook not yet implemented')
       const { id: queueEntryId, webhook_data } = queueEntry
       const { 
           id: opportunityId, 
           type: opportunityType, 
           contactId: opportunityContactId,
           status: opportunityStatus, 
           dateAdded: opportunityDateAdded, 
           assignedTo, monetaryValue, name, pipelineId, pipelineStageId, source, 
       } = webhook_data

       // Get contact and opportunity

       const contact: Maybe<Contact> = await getContactWithId(opportunityContactId)

       // const contact: Contact = {
       //     id: "TEST_CONTACT_ID",
       //     firstName: "DR Test Man",
       //     lastName: "The fortieth"
       // } as Contact
       
       const opportunity = await getOpportunityWithId(opportunityId)

       // const opportunity = {
       //     id: '323521',
       //     status: 'open',
       //     contactId: '12341235'
       // } as Opportunity

       if (typeof(contact) === 'undefined' || Object.is(contact, null)) {
           throw new Error(`OpportunityCreate event -- contact with ID: ${opportunityContactId} does not exist`)
       }

       if (typeof opportunity === 'undefined' || Object.is(opportunity, null)) {
           throw new Error(`OpportunityCreate event -- opportunity with ID: ${opportunityId} does not exist`)
       }

       // Create entry for Opportunity in database
       const { id: opportunityRowId } = await createNewGHLOpportunityRow(OpportunityStatusFromString[ opportunityStatus], opportunity, contact)
       // const { id: opportunityRowId } = await createNewGHLOpportunityRow(OpportunityStatusFromString[opportunity.status], opportunity, contact)

       // Search database for existing contact that may match Contact data from database
       // If the contact is found in the database, add the GHL contact ID to the service_ids field

       const { firstName, lastName, phone, emailLowerCase } = contact!

       try {
           const _existingGeneralContact: Maybe<GeneralContact> = await (async () => {
               const _id = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.GoHighLevel, opportunityContactId)

               if (typeof(_id) === 'undefined' || Object.is(_id, null)) {
                   return new Promise((resolve) => resolve(undefined))
               }

               const result = await getGeneralContactWithPrimaryKey(_id)

               return new Promise((resolve) => resolve(result))
           })() ?? await findGeneralContact({
               firstName,
               lastName,
               email: emailLowerCase,
               phoneNumber: phone
           })

           
           const generalContactExists: boolean = typeof(_existingGeneralContact) !== 'undefined' && !Object.is(_existingGeneralContact, null)

       
           const existingGeneralContact: GeneralContact = generalContactExists ? _existingGeneralContact! : await (async (): Promise<GeneralContact> => {
                // TODO -- Create new contact if it doesn't exist, otherwise use the one that was found
                // TODO -- Create the contact on Podium here
                const convertedContact: GeneralContact = await convertThirdPartyContactToGeneralContact(ThirdPartyService.GoHighLevel, contact!, generateSyncedWithServiceObject([ThirdPartyService.GoHighLevel]))
                const storedGeneralContact: GeneralContact = await storeGeneralContactInDatabase(ThirdPartyService.GoHighLevel, convertedContact)

                // if (typeof(generalContactEntry) === 'undefined' || Object.is(generalContactEntry,null)) {
                //     throw new Error(`General Contact entry with ID: ${generalContactId} does not exist`)
                // }

                const { id: storedGeneralContactId } = storedGeneralContact

                await updateGeneralContactServiceIdsValue(`${storedGeneralContactId}`, ThirdPartyService.GoHighLevel, opportunityContactId)

                const result: PodiumContact = (await syncContactToService[ThirdPartyService.Podium](convertedContact, undefined, opportunityContactId)) as PodiumContact

                await incrementServiceIdLock(ThirdPartyService.Podium, CreateOrUpdate.Create, result.uid)

                // Need to wait for this to be added through webhook

                // Get the entry using teh result contact ID
                // const generalContactId: Maybe<string> = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, result.uid)

                // // TODO -- Wait for the above entry to be created -- so wait for generalContactID to not be undefined any longer, then move forward
                // var generalContactId: Maybe<string> 
                // var retries: number = 1
                // var maxRetries: number = 10

                // do {
                //     await Wait(secondsToMilliseconds(2))

                //     generalContactId = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, result.uid)

                //     retries++
                // } while ((typeof(generalContactId) === 'undefined' || Object.is(generalContactId, null)) || retries > maxRetries)

                // if (typeof(generalContactId) === 'undefined' || Object.is(generalContactId, null)) {
                //     throw new Error(`Could not find general contact with Podium service ID: ${result.uid} `)
                // }
                
                // Then update the service_ids field on that contact with the new GHL contact ID
                // await updateGeneralContactServiceIdsValue(generalContactId, ThirdPartyService.GoHighLevel, opportunityContactId)

                // Set the synced_with_service field on the contact to true
                // await updateGeneralContactSyncedWithServicesValue(generalContactId, ThirdPartyService.GoHighLevel, true)

                return new Promise((resolve) => resolve(storedGeneralContact))

           })()

           const existingContactId: string = `${existingGeneralContact!.id!}`
           const existingGHLServiceId: string = existingGeneralContact.service_ids[ThirdPartyService.GoHighLevel]

           const hasExistingGHLServiceId: boolean = typeof(existingGHLServiceId) !== 'undefined' && !Object.is(existingGHLServiceId, null)
       
           if (!hasExistingGHLServiceId) {
               await updateGeneralContactServiceIdsValue(existingContactId, ThirdPartyService.GoHighLevel, opportunityContactId)
               await updateGeneralContactSyncedWithServicesValue(existingContactId, ThirdPartyService.GoHighLevel, true)
           }

           await updateGHLOpportunityRow(opportunityRowId, undefined, undefined, undefined, parseInt(existingContactId))

           const { hasAutomatedMessages, automatedMessages } = await checkForAutomatedMessageConfigurationsForTrigger(AutomatedMessageTrigger.GHLLeadCreated)

           if (hasAutomatedMessages) {
               //@ts-ignore
               const results = await automatedMessages.reduce(async (acc: Promise<boolean[]>, entry: AutomatedMessageConfigurationEntry): Promise<boolean[]> => {
                   const existing = await acc
   
                   try {
                       await processAutomatedMessageConfigurationEntry(entry, await generateDataObject(undefined, `${existingGeneralContact.id!}`))
   
                       return new Promise((resolve) => resolve([ ...existing, true ]))
                   } catch (error) {
                       console.error(`Error processing the automated message configuration ${entry.id}`)
                       console.error(error)
   
                       return new Promise((resolve) => resolve([...existing, false ]))
                   }
               }, [])
           }

       } catch (error) {
           await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
           await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

           return new Promise((resolve) => resolve(true))
       }

       await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

       return new Promise((resolve) => resolve(true))
}