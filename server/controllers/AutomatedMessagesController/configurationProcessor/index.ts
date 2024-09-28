import { PodiumMessageChannel } from "../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessageChannel";
import { sendPodiumMessage } from "../../../ThirdPartyServices/Podium/controllers/MessagesController/sendPodiumMessage";
import { andReduction, generateNumberRange, orReduction } from "../../../helpers/ArrayFunctions";
import { getRandomArrayValue } from "../../../helpers/getRandomArrayValue";
import { GeneralContact } from "../../../model/GeneralContact";
import { Maybe } from "../../../model/Maybe";
import { getAllDatabaseAppointments } from "../../BoulevardAppointmentsTableController/getAllDatabaseAppointments";
import { getDatabaseAppointmentWithAppointmentId } from "../../BoulevardAppointmentsTableController/getDatabaseAppointmentWithAppointmentId";
import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { getAllGeneralContacts } from "../../GeneralContactsController";
import { addIdsToAutomatedMessageLockEntry } from "../locksTable/addIdsToAutomatedMessageLockEntry";
import { getAllAutomatedMessageLockEntries } from "../locksTable/getAllAutomatedMessageLockEntries";
import { getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate } from "../locksTable/getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate";
import { AutomatedMessageConfigurationEntry, ContactCriteriaFunctionReturn, CustomContactCriteriaFunction, GeneralContactIDToAutomatedMessageDataObjectMap } from "../model/AutomatedMessageConfigurationEntry";
import { AutomatedMessageContactCriteria } from "../model/AutomatedMessageContactCriteria";
import { AutomatedMessageDataObject } from "../model/AutomatedMessageDataObject";
import { AutomatedMessageLockEntry } from "../model/AutomatedMessageLockEntry";
import { AutomatedMessageLockType } from "../model/AutomatedMessageLockType";
import { AutomatedMessageTemplateType } from "../model/AutomatedMessageTemplateType";
import { AutomatedMessageTrigger } from "../model/AutomatedMessageTrigger";
import { generateDataObject } from "./dataObjectGenerator";
import { generateMessageStringFromTemplateType } from "./templateProcessor";
import {  getHours, getMinutes} from 'date-fns'
import { AutomatedMessageTimeConfigEntry } from "../model/AutomatedMessageTimeConfigEntry";
import { timeTriggerFunction } from "./timeTriggerFunction";
import { contactCriteriaProcessor } from "./contactCriteriaProcessor";
import { utcToZonedTime } from "date-fns-tz";
import { Wait } from "../../../helpers/Wait";
import { getCurrentTimeWithTimezone } from "../../../helpers/getCurrentTimeWithTimezone";
import immediateActionTriggers from "./config/immediateActionTriggers";
import unimplementedActionTriggers from "./config/unimplementedActionTriggers";

// const immediateActionTriggers: AutomatedMessageTrigger[] = [
//     AutomatedMessageTrigger.BoulevardAppointmentCreated,
//     AutomatedMessageTrigger.BoulevardAppointmentUpdated,
//     AutomatedMessageTrigger.BoulevardAppointmentCancelled,
//     AutomatedMessageTrigger.BoulevardAppointmentCompleted,
//     AutomatedMessageTrigger.BoulevardAppointmentRescheduled,
//     AutomatedMessageTrigger.BoulevardAppointmentActive,
//     AutomatedMessageTrigger.BoulevardAppointmentConfirmed,
//     AutomatedMessageTrigger.BoulevardAppointmentArrived,
//     AutomatedMessageTrigger.GHLLeadCreated
// ]

// const unimplementedActionTriggers: AutomatedMessageTrigger[] = [
//     AutomatedMessageTrigger.TimeSpecificWithtimezone,
//     AutomatedMessageTrigger.TimeRelativeWithtimezone,
//     AutomatedMessageTrigger.GHLLeadCreated

// ]

const closedInboxTriggers = [
    AutomatedMessageTrigger.BoulevardAppointmentCancelled,
    AutomatedMessageTrigger.BoulevardAppointmentCompleted
]

const useClosedInboxTriggers: boolean = false

//? Key is the ID of the generalContact
export type _generalContactGeneratedStringsMap = {[key in string]: string}

export type _automatedMessageTriggerTypeToSendDeterminationFunctionMap = {[key in AutomatedMessageTrigger]: () => Promise<boolean>}

export type _messageSendResultsEntry = {
    success: boolean,
    sendDisableOverride: boolean,
    contact: GeneralContact,
    message: string,
    error?: any
}

export type AutomatedMessageConfigurationEntryProcessorOutput = {
    sendMessage: boolean,
    recipients: GeneralContact[],
    results: _messageSendResultsEntry[]
}


// TODO -- Replace the customCriteriaFunction and customTriggerFunction in the code below with a prebuilt function for each
// TODO    that uses the config items as the source of their parameters and stuff
export const processAutomatedMessageConfigurationEntry = async (
    configurationEntry: AutomatedMessageConfigurationEntry, 
    dataObject?: AutomatedMessageDataObject
): Promise<AutomatedMessageConfigurationEntryProcessorOutput> => {
    const { 
        triggerType, 
        timeTrigger, 
        templateType, 
        templateCustom,
        contactCriteria,
        contactCriteriaConfig,
        customTriggerConfig,
        lockType,
        restrictToHours,
        enabled,
        scheduleName
    } = configurationEntry

    if (!enabled) {
        return new Promise((resolve) => resolve({
            sendMessage: false,
            recipients: [],
            results: []
        }))
    }

    const actionIsImmediate = immediateActionTriggers.includes(triggerType)

    const hasCustomTriggerType = triggerType === AutomatedMessageTrigger.CustomFunction
    const hasTimeTriggerType = triggerType === AutomatedMessageTrigger.TimeRelativeWithtimezone || triggerType === AutomatedMessageTrigger.TimeSpecificWithtimezone || triggerType === AutomatedMessageTrigger.TimeSpecific
    const hasCustomContactCriteriaType = contactCriteria === AutomatedMessageContactCriteria.Custom
    const hasCurrentActionContactCriteriaType = contactCriteria === AutomatedMessageContactCriteria.CurrentAction || contactCriteria === AutomatedMessageContactCriteria.CurrentActionWithFunction
    const hasCurrentActionWithFunctionContactCriteriaType = contactCriteria === AutomatedMessageContactCriteria.CurrentActionWithFunction

    const needCustomContactCriteriaConfig = hasCustomContactCriteriaType || hasCurrentActionWithFunctionContactCriteriaType
    const needCustomTriggerConfig = hasCustomTriggerType

    const hasTemplateCustomType = templateType === AutomatedMessageTemplateType.Custom
    
    const hasTimeTrigger = typeof(timeTrigger) !== 'undefined' && !Object.is(timeTrigger, null)
    const hasCustomContactCriteriaConfig = typeof(contactCriteriaConfig) !== 'undefined' && !Object.is(contactCriteriaConfig, null)
    const hasCustomTriggerConfig = typeof(customTriggerConfig) !== 'undefined' && !Object.is(customTriggerConfig, null)

    // const hasCustomTriggerFunction = typeof(customTriggerFunction) !== 'undefined'
    // const hasCustomContactCriteriaFunction = typeof(contactCriteriaCustomFunction) !== 'undefined'

    const hasTemplateCustomStrings = typeof(templateCustom) !== 'undefined' && !Object.is(templateCustom, null)
    const hasDataObject = typeof(dataObject) != 'undefined' && !Object.is(dataObject, null)

    const needsDataObject =  hasCurrentActionContactCriteriaType // || hasCustomContactCriteriaType

    const hasLockType: boolean = lockType !== AutomatedMessageLockType.None
    const hasAppontmentLockType: boolean = lockType === AutomatedMessageLockType.DailyAppointment
    const useLock: boolean = hasLockType && hasCustomContactCriteriaType

    const hasRestrictToHours: boolean = typeof(restrictToHours) !== 'undefined' && !Object.is(restrictToHours, null)

    const currentTime = hasDataObject ? dataObject!.currentTime : getCurrentTimeWithTimezone()

    const currentTimeIsTriggerTime: Maybe<boolean> = hasTimeTrigger ? await (async ()=> {
        // console.log("Checking TimeTrigger:", scheduleName)

        // console.log("# of Time Entries:", timeTrigger.timeTriggers.length)
        const result = await timeTriggerFunction(hasDataObject ? dataObject!.currentTime : getCurrentTimeWithTimezone(), timeTrigger.timeTriggers)

        // console.log("TimeTrigger time is", result)

        if (result) {
            console.log(`--=== Running Automated Message Schedule: ${scheduleName} ===--`)
        }

        return new Promise((resolve) => resolve(result))
    })() : undefined

    // if (useLock && typeof(contactCriteriaCustomFunction) === 'undefined') {

    if (typeof(currentTimeIsTriggerTime) !== 'undefined') {
        if (!currentTimeIsTriggerTime) return new Promise((resolve) => resolve({ sendMessage: false , recipients: [], results: [] }))
    }
    //     throw new Error('Contact criteria custom function is required when using a lock')
    // }

    //#region Input Integrity Checks
    if (needCustomTriggerConfig && !hasCustomTriggerConfig) {
        throw new Error(`Custom trigger configuration is required for custom trigger type`)
    }

    if (hasTimeTriggerType && !hasTimeTrigger) {
        throw new Error(`Time trigger is required for time-based trigger types`)
    }

    if (needCustomContactCriteriaConfig && !hasCustomContactCriteriaConfig) {
        throw new Error(`Custom contact criteria configuration is required for custom contact criteria type`)
    }

    if (needsDataObject && !hasDataObject) {
        throw new Error(`Data object is required for Custom and CurrentAction contact criteria types`)
    }

    if (hasTemplateCustomType && !hasTemplateCustomStrings) {
        throw new Error(`Custom template string is required for custom template type`)
    }
    
    if (hasCurrentActionContactCriteriaType && !dataObject!.hasData.contact) {
        throw new Error(`Data object does not contain a contact`)
    }

    if (unimplementedActionTriggers.includes(triggerType)) {
        throw new Error(`Trigger type ${triggerType} is not implemented`)
    }
    //#endregion

    try {
        //#region Contact Criteria
        const allContacts: Maybe<GeneralContact[]> = contactCriteria === AutomatedMessageContactCriteria.All || hasCustomContactCriteriaType ? await getAllGeneralContacts() : undefined

        const allAppointments: Maybe<BoulevardAppointmentsTableRow[]> = await getAllDatabaseAppointments() 

        const customContactCriteriaAppointmentRow = hasCurrentActionWithFunctionContactCriteriaType ? await (async (): Promise<Maybe<BoulevardAppointmentsTableRow>> => {
            if (!dataObject!.hasData.appointment) {
                return new Promise(resolve => resolve(undefined))
            }

            const { id } = dataObject!.data.appointment!
            try {
                
                const appointmentRow = await getDatabaseAppointmentWithAppointmentId(id as string)

                if (typeof(appointmentRow) === 'undefined') {
                    throw new Error(`Could not find appointment with id ${id}`)
                }

                return new Promise(resolve => resolve(appointmentRow))
            } catch (error) {
                console.error(`Could not find appointment with id ${id}`)
                console.error(error)

                return new Promise(resolve => resolve(undefined))
            }
        })() : undefined

        const contactCriteriaCustomFunction: Maybe<CustomContactCriteriaFunction> = hasCustomContactCriteriaType && hasCustomContactCriteriaConfig ? contactCriteriaProcessor : undefined

        // TODO -- Write this too lol
        // TODO -- So this one needs to basically just decide if the current time is the time to fire off
        // TODO -- Actually, I'm going to move the time triggers to the timeTrigger stuff lol
        
        const customTriggerFunction: Maybe<any> = hasCustomTriggerType && hasCustomTriggerConfig ? () => {

        } : undefined

        const getContactsWithCriteria: {[key in AutomatedMessageContactCriteria]: () => Promise<ContactCriteriaFunctionReturn>} = {
            [AutomatedMessageContactCriteria.All]: async () => new Promise((resolve) => resolve({
                contacts: allContacts!
            })),
            [AutomatedMessageContactCriteria.CurrentAction]: async () => new Promise((resolve) => resolve({
                contacts: [dataObject!.data.contact!]
            })),
            //@ts-ignore
            [AutomatedMessageContactCriteria.CurrentActionWithFunction]: async () => contactCriteriaCustomFunction!(
                contactCriteriaConfig,
                dataObject!.hasData.contact ? [dataObject!.data.contact!] : [], 
            ),
            [AutomatedMessageContactCriteria.Custom]: async () => contactCriteriaCustomFunction!(contactCriteriaConfig, allContacts!),
        }

        const contactsCriteriaResult = await getContactsWithCriteria[contactCriteria]()

        // console.log("Contact criteria result: ")
        // console.log(contactsCriteriaResult)
        
        const filteredContacts = contactsCriteriaResult.contacts
        // console.log(`Filtered contacts: ${filteredContacts.length} `)
        // console.log(contactsCriteriaResult.data)

        // console.log("CONTACTS CRITERIA ERROR")
        // console.log(contactsCriteriaResult.error)

        const customCriteriaData: Maybe<GeneralContactIDToAutomatedMessageDataObjectMap> = contactsCriteriaResult.data
        const hasCustomCriteriaData: boolean = typeof(contactsCriteriaResult.data) !== 'undefined' && hasCustomContactCriteriaType

        console.log("CUSTOM CRITERIA DATA")
        console.log(customCriteriaData)
        //#endregion

        // { key is the ID of the generalContact, value is if the message should be sent at this moment}
        const shouldMessageBeSentFunctionMap: _automatedMessageTriggerTypeToSendDeterminationFunctionMap = {
            //#region Immediate Triggers
            //@ts-ignore
            ...(immediateActionTriggers.reduce((acc: Promise<_automatedMessageTriggerTypeToSendDeterminationFunctionMap>, trigger: AutomatedMessageTrigger): Promise<_automatedMessageTriggerTypeToSendDeterminationFunctionMap> => (
                {
                    ...acc,
                    [trigger]: () => new Promise((resolve) => resolve(true))
                }
            ), {})),
            //#endregion
            [AutomatedMessageTrigger.CustomFunction]: async (): Promise<boolean> => customTriggerFunction!(currentTime, allContacts ?? [], allAppointments ?? []),
            [AutomatedMessageTrigger.TimeRelativeWithtimezone]: async (): Promise<boolean> => {
                // TODO
                return new Promise((_, reject) => reject(new Error(`Not Implemented`)))
            },
            [AutomatedMessageTrigger.TimeSpecificWithtimezone]: async (): Promise<boolean> => {
                // TODO

                return new Promise((_, reject) => reject(new Error(`Not Implemented`)))
            },
            [AutomatedMessageTrigger.TimeSpecific]: (): Promise<boolean> => {
                // Take the contents of timeTrigger and determine if it's time to send the message. This can easily be done
                // By using reducing the time to an hour:minute, and then if the currentTime hour:minute is the same, return true
                
                try {
                    const { timeTriggers } = timeTrigger!
                    
                    // const currentTime: Date = hasDataObject ? dataObject!.currentTime : new Date()
                    //@ts-ignore

                    // Use an orReduction on the array, so any one of the time combinations will return true.
                    const result = orReduction(timeTriggers.reduce((acc: boolean[], triggerTime: AutomatedMessageTimeConfigEntry): boolean[] => {
                        const [currentHours, currentMinutes] = [getHours(currentTime), getMinutes(currentTime)]
                        const [triggerHours, triggerMinutes] = [getHours(triggerTime.hour), getMinutes(triggerTime.minutes)]

                        return [...acc, triggerHours === currentHours && triggerMinutes === currentMinutes]    
                    }))

                    console.log("SHOULD SEND?", result)

                    return new Promise((resolve) => resolve(result))
                } catch (error) {
                    console.error('Time specific trigger error')
                    console.error(error)

                    return new Promise((_, reject) => reject(error))
                }
            }
        } 

        const messageLocksObject: Maybe<AutomatedMessageLockEntry> = useLock ? await(async () => {
            const { id, lockType } = configurationEntry

            
            try {
                const locksObject: Maybe<AutomatedMessageLockEntry> = await getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate(id!, lockType, new Date())
                
                if (typeof(locksObject) === 'undefined' || Object.is(locksObject, null)) {
                    throw new Error(`Could not find a lock entry with the given ID`)
                }

                return new Promise((resolve) => resolve(locksObject!))
            } catch (error) {
                console.error(`Could not determine message lock override for ${configurationEntry.id}`)
                console.error(error)

                return new Promise((_, reject) => reject(error))
            }
        })() : undefined

        const useMessageLockOverride = useLock ? typeof(messageLocksObject) !== 'undefined' : false

        const shouldMessageBeSent: boolean = actionIsImmediate ? true 
            : hasTimeTrigger ? currentTimeIsTriggerTime ?? false
            : await shouldMessageBeSentFunctionMap[triggerType]()

        if (!shouldMessageBeSent) {
            return {
                sendMessage: false,
                recipients: filteredContacts,
                results: []
            }
        }

        const generateDataObjectForCurrentContact = async (currentContact): Promise<AutomatedMessageDataObject> => {

            const { hasData, data } = customCriteriaData![currentContact.id!]
            const { appointment: hasAppointment, contact: hasContact } = hasData
            

            const hasAppointmentId = (() => {
                if (!hasAppointment) return false
                if (typeof(data.appointment?.id) === 'undefined') return false
                return true
            })
            const hasContactId =  (() => {
                if (!hasContact) return false
                if (typeof(data.contact?.id) === 'undefined') return false
                return true
            })
            

            const result = await generateDataObject(
                hasAppointmentId() ? data.appointment?.id : undefined,
                hasContactId() ? `${data.contact?.id}` : undefined
            )

            return new Promise((resolve) => resolve(result))

        }

        //#region Template Stuff
        //@ts-ignore
        const generatedStrings: _generalContactGeneratedStringsMap = await filteredContacts.reduce(
            //@ts-ignore
            async (allGeneratedStrings: Promise<_generalContactGeneratedStringsMap>, currentContact: GeneralContact): Promise<_generalContactGeneratedStringsMap> => {
                const existing: _generalContactGeneratedStringsMap = await allGeneratedStrings

                try {
                    //? When ContactCriteria is Custom, generate a data object for each contact from the result of the custom criteria function
                    //?     otherwise, all messages will be the same as it is assumed that the message will only be for one contact, or is not meant to be customized to each user
                    ///? When a data object is provided, use that data object to generate the message string. Only current action messages should have a data object provided

                    const generatedString: string = await generateMessageStringFromTemplateType(
                        templateType, 
                        hasCustomCriteriaData ? customCriteriaData![currentContact.id!]
                        // await generateDataObjectForCurrentContact(currentContact) 
                        : hasDataObject ? dataObject : await generateDataObject(
                            // //! DATA OBJECT WILL NEVER BE UNDEFINED, SO THIS FUNCTION IS JUST JUNK... IT WOULD ALWAYS BE UNDEFINED ANYWAY SINCE IT REFERS TO THE OBJECT ITS CREATING
                            // dataObject!.hasData.appointment ? dataObject!.data.appointment!.id! : undefined,
                            // dataObject!.hasData.contact ? `${!dataObject!.data.contact!.id!}` : undefined
                            undefined, undefined
                        ),
                        hasTemplateCustomType ? getRandomArrayValue<string>(templateCustom!) : undefined
                    )

                    const id: string = `${currentContact.id}`

                    return new Promise<_generalContactGeneratedStringsMap>((resolve) => resolve({
                        ...existing,
                        [id]: generatedString
                    }))
                } catch (error) {
                    console.error(`Could not generate message string for contact ${currentContact.id}`)
                    console.error(error)

                    return new Promise<_generalContactGeneratedStringsMap>((_, reject) => reject(error))
                }
            }, {})
        //#endregion

        //@ts-ignore
        const results: _messageSendResultsEntry[] = await filteredContacts.reduce(
            async (acc: Promise<_messageSendResultsEntry[]>, currentContact: GeneralContact): Promise<_messageSendResultsEntry[]> => {
                const existing: _messageSendResultsEntry[] = await acc
                const generatedString = generatedStrings[currentContact.id!]

                //! Use this to retrieve the appropriate IDs for the message lock
                //! MESSAGE LOCK REQUIRES CUSTOM CRITERIA FUNCTION TO BE DEFINED WHEN APPOINTMENTS ARE INVOLVED FOR NOW
                //! EVENTUALLY IT SHOULD BE ABLE TO WORK WITH THE ACTION_CURRENT CRITERIA AS WELL

                const messageLockAppointmentHandler = async (): Promise<string> => {
                    const _dataObject = hasCustomCriteriaData ? customCriteriaData![currentContact.id!] : hasDataObject ? dataObject : undefined

                    if (typeof(_dataObject) === 'undefined' || Object.is(_dataObject, null)) {
                        throw new Error(`Could not find a data object with the given ID`)
                    }
                    
                    const { hasData, data } = _dataObject!
                    const { appointment: hasAppointment } = hasData

                    if (hasAppointment) {
                        return new Promise((resolve) => resolve(data.appointment!.id! as string))
                    }

                    return new Promise((_, reject) => reject(new Error(`Could not find an appointment for contact ${currentContact.id}`)))
                }

                const messageLockContactHandler = async (): Promise<string> => new Promise((resolve) => resolve(`${currentContact.id!}`))

                const messageLockKeyMap: {[key in AutomatedMessageLockType]: () => Promise<string>} = {
                    [AutomatedMessageLockType.None]: async () => {
                        throw new Error(`Not Implemented`)
                    },
                    [AutomatedMessageLockType.DailyAppointment]: messageLockAppointmentHandler,
                    [AutomatedMessageLockType.OncePerAppointment]: messageLockAppointmentHandler,
                    
                    // // TODO -- Since the data object is included with action_current and action_current_with_function, the DailyAppointment function above
                    // // TODO        should also work with DailyContact, using the same function almost. This will need testing for sure since I'm getting a little confused now.
                    // The ID that needs to be returned here is the ContactID
                    [AutomatedMessageLockType.OnceInLifetime]: messageLockContactHandler,
                    [AutomatedMessageLockType.OnceYearlyContact]: messageLockContactHandler
                }

                try {
                    const messageLockKey = useMessageLockOverride ? await messageLockKeyMap[configurationEntry.lockType]!() : undefined
                    const messageIsLocked = useMessageLockOverride && (messageLocksObject?.locks ?? []).includes(messageLockKey ?? '')

                    if ( !messageIsLocked ) {
                        //! THIS IF IS JUST FOR TESTING -- REMOVE AFTER TESTING AND UNCOMMENT THE ONE FURTHER DOWN
                        // if (useMessageLockOverride && typeof(messageLockKey) !== 'undefined') {
                        //     await addIdsToAutomatedMessageLockEntry(messageLocksObject!.id ,[messageLockKey!])
                        // }

                        try {
                            await sendPodiumMessage(
                                currentContact,
                                PodiumMessageChannel.Phone,
                                generatedString,
                                'Haus of Confidence', // TODO: Maybe this could be a thing from appointments in the future
                                undefined,
                                undefined,
                                useClosedInboxTriggers ? !closedInboxTriggers.includes(triggerType) : undefined                        
                            )

                            if (useMessageLockOverride && typeof(messageLockKey) !== 'undefined') {
                                await addIdsToAutomatedMessageLockEntry(messageLocksObject!.id ,[messageLockKey!])
                            }
    
                            await Wait(300)

                        } catch (error) { throw error }
                        
                    }

                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            success: true,
                            contact: currentContact,
                            message: generatedString,
                            sendDisableOverride: messageIsLocked
                        }
                    ]))
                } catch (error) {
                    return new Promise((resolve) => resolve([
                      ...existing,
                      {
                        success: false,
                        contact: currentContact,
                        message: generatedString,
                        error: error,
                        sendDisableOverride: false
                      }
                    ]))
                }
            }, [])

            return new Promise((resolve) => resolve({
                sendMessage: true,
                recipients: filteredContacts,
                results
            }))

    } catch (error) {
        console.error(`Unable to process automated message configuration entry:`) 
        console.error(configurationEntry)
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}