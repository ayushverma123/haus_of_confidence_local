import { onNSecondsEveryMinute } from "../../../constants/cronIntervals"
import { MutexTypes, getMutex, modifyMutex } from "../../../controllers/MutexController"
import { CronTask } from "../../../lib/CronTask"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { announceToConsole as _announceToConsole, skippingTaskPrefix } from "../../../lib/CronTask"
import { getInitialAppointmentsSyncCompletedValue, getInitialContactImportCompletedValue, updateInitialAppointmentsSyncCompletedValue } from "../StateManager/BlvdStateManager"
import { getPodiumInitialContactSyncCompletedValue } from "../../Podium/stateManager"
import { getAllAppointments } from "../controllers/AppointmentsController/getAllAppointments"
import { Appointment } from "../model/Appointment"
import { createNewAppointmentRow } from "../../../controllers/BoulevardAppointmentsTableController/createNewAppointmentRow"
import systemServiceIdentifier from '../../../constants/systemServiceIdentifier'
import { StateStore } from "../../../controllers/StateManager"
import { getGeneralContactPrimaryKeyWithServiceContactId } from "../../../controllers/GeneralContactsController"
import { AppointmentState } from "../model/Appointment/AppointmentState"
import { isInitialContactSyncCompleted } from "../../../tasks/WebhooksQueue/helpers/isInitialContactSyncCompleted"

const taskName = 'Import Boulevard Appointments'
const service = ThirdPartyService.Boulevard
const mutexType = MutexTypes.BlvdApptPull

type importResult = {
    appointmentId: string,
    success: boolean,
    error?: any
}

const importAppointments = CronTask(onNSecondsEveryMinute(50), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false) 

    // Check if Podium contact import has completed
    if (!await getPodiumInitialContactSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Podium contacts have not been imported`)
        return
    }

    // Check if Boulevard contact import has completed
    if (!await getInitialContactImportCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Boulevard clients have not been imported`)
        return
    }

    // Check if one time contact sync has completed
    if (!await isInitialContactSyncCompleted()) {
        announceToConsole(`${skippingTaskPrefix} One Time Contact Sync not completed`)
        return
    }

    if (await getInitialAppointmentsSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Appointments have already been imported`)
        return
    }

    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            // Retrieve all of the Boulevard appointments
            // filter out all appointments that are completed
            const allAppointments: Appointment[] = await getAllAppointments()
                // .filter(({ state }) =>  state === AppointmentState.)

            // Add all appointments to the database

            //@ts-ignore
            const importResults: importResult[] = await allAppointments.reduce(async (allResults: Promise<importResult[]>, appointment: Appointment): Promise<importResult[]> => {
                const existing = await allResults

                const _contactId = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Boulevard, appointment.clientId as string)

                // console.group("CONTACT ID:")
                // console.log(_contactId)
                // console.log(typeof(_contactId))
                // console.groupEnd()

                const contactId: number = parseInt(_contactId!)

                try {
                    await createNewAppointmentRow(contactId, appointment.id as string, appointment)

                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            appointmentId: appointment.id as string,
                            success: true
                        }
                    ]))
                } catch (error) {
                    return new Promise((resolve) => resolve([
                        ...existing,
                        {
                            appointmentId: appointment.id as string,
                            success: false,
                            error
                        }
                    ]))
                }
            }, [])

            const successes = importResults.filter(({ success }) => success)
            const failures = importResults.filter(({ success }) => !success)
            
            const anyFailures = failures.length > 0
            const anySuccesses = successes.length > 0

            const allFailures = failures.length === importResults.length
            const allSuccesses = successes.length === importResults.length


            // Set state to complete
            await updateInitialAppointmentsSyncCompletedValue(true)

            await unlockMutex()

        } catch (error) {
            console.error(`Could not import Boulevard appointments`)
            console.error(error)

            await unlockMutex()
        }

    } else {
        announceToConsole(`${skippingTaskPrefix} Boulevard Appointment Import already running`)
    }

})

module.exports = importAppointments