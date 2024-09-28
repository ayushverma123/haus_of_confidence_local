import { onNSecondsEveryMinute } from "../../constants/cronIntervals"
import { MutexTypes, getMutex, modifyMutex } from "../../controllers/MutexController"
import { CronTask, skippingTaskPrefix } from "../../lib/CronTask"
import { announceToConsole as _announceToConsole} from "../../lib/CronTask"
import systemServiceIdentifier from "../../constants/systemServiceIdentifier"
import { getPodiumInitialContactSyncCompletedValue, getPodiumWebhookCheckCompletedValue } from "../../ThirdPartyServices/Podium/stateManager"
import { getInitialContactImportCompletedValue, getServiceWebhookRegistrationStatus } from "../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager"
import { getGHLRegistrationStatus } from "../../ThirdPartyServices/GoHighLevel/stateManager"
import { isInitialContactSyncCompleted } from "../WebhooksQueue/helpers/isInitialContactSyncCompleted"
import { getAllGeneralContacts } from "../../controllers/GeneralContactsController"
import { ThirdPartyService, ThirdPartyServiceMap, thirdPartyServiceFromLowercaseServiceName } from "../../model/ThirdPartyService"
import { GeneralContact } from "../../model/GeneralContact"
import { ServiceContactProcessingFunctionMap } from "./model/ServiceContactProcessingFunctionMap"
import processPodiumContactBirthdays from "./processPodiumContacts"
import processBoulevardContactBirthdays from "./processBoulevardContacts"

const service = `${systemServiceIdentifier}__birthdateSync`

const taskName = "Birthdate Sync"
const mutexType = MutexTypes.BirthdateSync

const birthdateSyncTask = CronTask(onNSecondsEveryMinute(25), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    //! -- REENABLE THIS BEFORE PRODUCTION
    // Check that contact sync has occured already
    // if (!(await getInitialContactImportCompletedValue() && await getPodiumInitialContactSyncCompletedValue()) && await isInitialContactSyncCompleted()) {
    //     announceToConsole(`${skippingTaskPrefix} Skipping birthdate sync processing task`)
    //     return
    // }
    //! -- END OF REENABLE SECTION
    

    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            const allContactsWithoutBirthdate = await getAllGeneralContacts(undefined, true, false)
            
            //@ts-ignore
            const contactsSortedByService = Object.values(ThirdPartyService).reduce((acc: ServiceContactMap, currentService: ThirdPartyService): ServiceContactMap => {
                const currentServiceLowercase: string = currentService.toLowerCase()

                return {
                    ...acc,
                    [currentServiceLowercase]: allContactsWithoutBirthdate.filter(({original_service}) => original_service === currentServiceLowercase)
                }
            }, {})

            Object.keys(contactsSortedByService).forEach((serviceKey) => {
                console.log(`Contacts for service ${serviceKey}: `, contactsSortedByService[serviceKey].length)
            })            

            //@ts-ignore
            const syncResults = await Object.keys(contactsSortedByService).reduce(async (acc: Promise<boolean[]>, service: ThirdPartyService): Promise<boolean[]> => {
                const existing = await acc
                const serviceContacts = contactsSortedByService[service]

                console.log(`Processing ${service.toUpperCase()} contacts...`)

                const serviceFunctions: ServiceContactProcessingFunctionMap = {
                    [ThirdPartyService.Boulevard]: processBoulevardContactBirthdays,
                    [ThirdPartyService.Podium]: processPodiumContactBirthdays,
                    [ThirdPartyService.GoHighLevel]:  (contacts: GeneralContact[]) => {
                        // throw new Error("Not implemented")
                        return new Promise((resolve) => resolve(true))
                    } 
                }

                try {
                    const result = await serviceFunctions[thirdPartyServiceFromLowercaseServiceName[service]](serviceContacts)
                    return [...existing, result]
                } catch (error) {
                    console.error(`Error processing ${service.toUpperCase()} contact birthdays`)
                    console.error(error)

                    return new Promise((resolve) => resolve([...existing, false]))
                }
            }, new Promise(resolve => resolve([])))

            await unlockMutex()
        } catch (error) {
            console.error(`Could not sync birthdates`)
            console.error(error)

            await unlockMutex()
        }
    } else {
        announceToConsole(`${skippingTaskPrefix} ${taskName} already running`)
    }

})

module.exports = birthdateSyncTask