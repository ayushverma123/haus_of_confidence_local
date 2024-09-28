import { everyNSeconds } from "../../constants/cronIntervals"
import { MutexTypes, getMutex, modifyMutex } from "../../controllers/MutexController"
import { CronTask, announceToConsole as _announceToConsole, skippingTaskPrefix } from "../../lib/CronTask"
import systemServiceIdentifier from "../../constants/systemServiceIdentifier"
import { WebhooksQueueTableRow } from "../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { getAllWebhooksQueueEntries } from "../../controllers/WebhooksQueue/tableController/getAllWebhooksQueueEntries"
import { updateWebhooksQueueEntryProcessedValues } from "../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryProcessedValues"
import { updateWebhooksQueueEntrySuccessValue } from "../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { updateWebhooksQueueEntryErrorValue } from "../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import webhookTypeProcessingFunction from "./processingFunctionsMap"

const taskName = 'Process Webhooks Queue'
const mutexType = MutexTypes.WebhooksQueueProcessing

const processWebhooksQueueTask = CronTask(everyNSeconds(3), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, true)

    const unlockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, false)

    // // TODO -- Needs to also check for GHL webhook Registration status
    // Check that webhooks are completed
    //! -- REENABLE THIS BEFORE PRODUCTION
    // if (!(await getPodiumWebhookCheckCompletedValue()) || !(await getServiceWebhookRegistrationStatus()) || !(await getGHLRegistrationStatus())) {
    //     announceToConsole(`${skippingTaskPrefix} Skipping webhooks queue processing, webhooks not completed`)
    //     return
    // }
    //! -- END OF REENABLE SECTION

    // Check if mutex is locked
    if (await getMutex(systemServiceIdentifier, mutexType)) {
        // Mutex is locked, task is still running
        announceToConsole(`${skippingTaskPrefix} Process Webhooks Queue Task already running`)
        return
    }

    try {
        await lockMutex()

        const allUnprocessedEntries: WebhooksQueueTableRow[] = (await getAllWebhooksQueueEntries()).filter(({ processed }) => !processed)
            .sort((a, b) => {
                const aDate = a.received_at.toISOString()
                const bDate = b.received_at.toISOString()

                return aDate < bDate ? -1 : aDate > bDate? 1 : 0
            })

        //! The purpose of this queue is to allow me to process webhooks in the order they were received
        //! and also control their processing order if needed

        //@ts-ignore
        const processingResults: boolean[] = allUnprocessedEntries
        //@ts-ignore
            .reduce(async (acc: Promise<boolean[]>, currentEntry: WebhooksQueueTableRow): Promise<boolean[]> => {
                const existing = await acc

                try {
                    await webhookTypeProcessingFunction[currentEntry.type](currentEntry)

                } catch (error) {
                    console.error("ERROR PROCESSING WEBHOOK", currentEntry.id, currentEntry.type)
                    console.error(error)
                    
                    await updateWebhooksQueueEntrySuccessValue(currentEntry.id, false)
                    await updateWebhooksQueueEntryErrorValue(currentEntry.id, error as Error)

                    await updateWebhooksQueueEntryProcessedValues(currentEntry.id, true)
                    
                    // return new Promise((_, reject) => reject(error))
                    return new Promise((resolve) => resolve([...existing, false]))
                }

                await updateWebhooksQueueEntryProcessedValues(currentEntry.id, true)

                return new Promise((resolve) => resolve([...existing, true]))
            }, [] as boolean[])


        await unlockMutex()
    } catch (error) {
        console.error(`Unable to process webhooks queue`)
        console.error(error)

        await unlockMutex()
    }

})

module.exports = processWebhooksQueueTask