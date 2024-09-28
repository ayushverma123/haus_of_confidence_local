import { MutexTypes, getMutex, modifyMutex } from "../../controllers/MutexController"
import systemServiceIdentifier from "../../constants/systemServiceIdentifier"
import { CronTask, skippingTaskPrefix } from "../../lib/CronTask"
import { everyNSeconds } from "../../constants/cronIntervals"
import { announceToConsole as _announceToConsole } from '../../lib/CronTask';
import { MessageQueueTableRow } from "../../controllers/MessageQueueController/model/MessageQueueTableRow";
import { getAllMessageQueueEntries } from "../../controllers/MessageQueueController/tableController/getAllMessageQueueEntries";
import { MessageStatus } from "../../controllers/MessageQueueController/model/MessageStatus";
import { sendPodiumMessage } from "../../ThirdPartyServices/Podium/controllers/MessagesController/sendPodiumMessage";
import { getGeneralContactWithPrimaryKey } from "../../controllers/GeneralContactsController";
import { GeneralContact } from "../../model/GeneralContact";
import { Maybe } from "../../model/Maybe";
import { getInitialAppointmentsSyncCompletedValue } from "../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import maxRetries from "./constants/maxRetries";
import { removeMessageQueueEntry } from "../../controllers/MessageQueueController/tableController/removeMessageQueueEntry";
import { isInitialContactSyncCompleted } from "../WebhooksQueue/helpers/isInitialContactSyncCompleted";


const taskName: string = "Retry Failed Message Queue Entries"
const mutexType = MutexTypes.MessageQueueRetry

type _MessageRetryResultEntry = {
    success: boolean,
    messageQueueTableRow: MessageQueueTableRow,
    error?: any
}

const retryFailedMessageQueueEntriesTask = CronTask(everyNSeconds(60), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, true)

    const unlockMutex = async () => await modifyMutex(systemServiceIdentifier, mutexType, false)

    // Check that initial contact sync has completed
    if (!await isInitialContactSyncCompleted()) {
        announceToConsole(`${skippingTaskPrefix} Initial Contact Sync not completed`)

        return
    }

    // Check that appointments have been imported
    if (!await getInitialAppointmentsSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Appointments have not been imported`)

        return
    }

    // Check if mutex is locked
    if (await getMutex(systemServiceIdentifier, mutexType)) {
        // Mutex is locked, task is still running
        announceToConsole(`${skippingTaskPrefix} Retry Failed Message Queue Entries Task already running`)
        return
    }

    try {
        await lockMutex()

        const allEntries: MessageQueueTableRow[] = await getAllMessageQueueEntries()

        // Retrieve all failed message queue entries
        const failedMessages: MessageQueueTableRow[] = allEntries.filter(item => item.status === MessageStatus.Failed && item.retries <= maxRetries)

        const messagesThatHaveExceededMaximumRetries: MessageQueueTableRow[] = allEntries.filter(
            ({ retries, status }) => retries > maxRetries && status === MessageStatus.Failed)

        if (messagesThatHaveExceededMaximumRetries.length > 0) {
            //@ts-ignore
            await messagesThatHaveExceededMaximumRetries.reduce(async (acc: Promise<boolean[]>, messageEntry: MessageQueueTableRow): Promise<boolean[]> => {
                const existing = await acc

                try {
                    await removeMessageQueueEntry(messageEntry.id)

                    return new Promise((resolve) => resolve([
                        ...existing,
                        true
                    ]))
                } catch (error) {
                    return new Promise((resolve) => resolve([
                      ...existing,
                        false
                    ]))
                }
            }, [])
        }

        if (failedMessages.length <= 0) {
            announceToConsole(`${skippingTaskPrefix} No Failed Message Queue Entries found`)
            await unlockMutex()
        }

        // Now resend each failed message
        //@ts-ignore
        const result: _MessageRetryResultEntry[] = await failedMessages.reduce(
            async (acc: Promise<_MessageRetryResultEntry[]>, currentRow: MessageQueueTableRow): Promise<_MessageRetryResultEntry[]> => {
                const existing = await acc

                const { recipient, communicate_using, text } = currentRow

                try {
                    const contact: Maybe<GeneralContact> = await getGeneralContactWithPrimaryKey(`${recipient}`)

                    if (typeof(contact) === "undefined" || Object.is(contact, null)) {
                        throw new Error(`Could not find contact with primary key ${recipient}`)
                    }

                    await sendPodiumMessage(contact, communicate_using, text, undefined, undefined, true)

                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            success: true,
                            messageQueueTableRow: currentRow
                        }
                    ]))
                } catch (error) {
                    return new Promise((resolve) => resolve([
                      ...existing,
                        {
                            success: false,
                            messageQueueTableRow: currentRow,
                            error
                        }
                    ]))
                }
            }
        , [])

        await unlockMutex()

    } catch (error) {
        console.error(`Unable to process failed message queue entries`)
        console.error(error)

        await unlockMutex()
    }
})

module.exports = retryFailedMessageQueueEntriesTask