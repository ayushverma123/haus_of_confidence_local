import { everyNSeconds, onNSecondsEveryMinute } from "../../constants/cronIntervals";
import { MutexTypes, getMutex, modifyMutex } from "../../controllers/MutexController";
import { CronTask, skippingTaskPrefix } from "../../lib/CronTask";
import { intervalInSeconds } from "./automatedMessageTaskRepeatInterval";
import { announceToConsole as _announceToConsole } from "../../lib/CronTask";
import systemServiceIdentifier from "../../constants/systemServiceIdentifier";
import { AutomatedMessageConfigurationEntry } from "../../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry";
import { getAllAutomatedMessageConfigurations } from "../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurations";
import { processAutomatedMessageConfigurationEntry } from "../../controllers/AutomatedMessagesController/configurationProcessor";
import { Wait } from "../../helpers/Wait";
import { getAllAutomatedMessageConfigurationsForTriggerType } from "../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurationsForTriggerType";
import { AutomatedMessageTrigger } from "../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger";
import { getInitialAppointmentsSyncCompletedValue } from "../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import { isInitialContactSyncCompleted } from "../WebhooksQueue/helpers/isInitialContactSyncCompleted";

const taskName = "Automated Messages Processing Task"

const mutexType = MutexTypes.AutomatedMessageProcessing

type taskResultsEntry = {
    success: boolean,
    automatedMessageConfigurationEntry: AutomatedMessageConfigurationEntry,
    error?: any
}

const automatedMessagesProcessingTask = CronTask(onNSecondsEveryMinute(2), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, true)

    const unlockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, false)

    //? This needs its own set of mutexes
    //? Actually, it might not need any more than the single one for itself
    //? The biggest issue is how to prevent multiple messages being sent to the same contact because each time the task is run,
    //? Something that was true last time is still true now

    //? ^^^ To help mitigate the above, the number of seconds between each time this task is run will be an exported value
    //? This value can then be used in the time functions to calculate an offset that keeps the task within that single interval
    //? So it is only true during a single run of the task

    // Check that Initial Contact Sync has completed
    if (!await isInitialContactSyncCompleted()) {
        announceToConsole(`${skippingTaskPrefix} Initial Contact Sync not completed`)

        return
    }

    if (!await getInitialAppointmentsSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Appointments have not been imported`)
        
        return
    }

    // Check if mutex is locked
    if (await getMutex(systemServiceIdentifier, mutexType)) {
        // Mutex is locked, task is still running
        announceToConsole(`${skippingTaskPrefix} Automated Messages Processing Task already running`)
        return
    }

    try {
        await lockMutex()

        // Retrieve all automatedMessageConfigurationEntries
        // const allConfigEntries: AutomatedMessageConfigurationEntry[] = await getAllAutomatedMessageConfigurations(true)
        const customConfigEntries: AutomatedMessageConfigurationEntry[] = await getAllAutomatedMessageConfigurationsForTriggerType(AutomatedMessageTrigger.TimeSpecific, true)
        
        if (customConfigEntries.length <= 0) {
            announceToConsole(`${skippingTaskPrefix} No Automated Message Configurations found`)

            await unlockMutex()

            return
        }

        // Now process each config entry
        //@ts-ignore
        const results: taskResultsEntry[] = await customConfigEntries.reduce(
            async (acc: Promise<taskResultsEntry[]>, configEntry: AutomatedMessageConfigurationEntry): Promise<taskResultsEntry[]> => {
                const existing = await acc

                await Wait(100)

                try {
                    //? processAutomatedMessageConfigurationEntry() with only the configuration object means it acts on the contacts from the contact criteria settings
                    await processAutomatedMessageConfigurationEntry(configEntry)

                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            success: true,
                            automatedMessageConfigurationEntry: configEntry
                        }
                    ]))
                } catch (error) {
                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            success: false,
                            automatedMessageConfigurationEntry: configEntry,
                            error
                        }
                    ]))
                }
            }, [])

            await unlockMutex()
    } catch (error) {

        console.error(`Unable to process automated message configuration entries`)
        console.error(error)

        await unlockMutex()
    }

})

module.exports = automatedMessagesProcessingTask