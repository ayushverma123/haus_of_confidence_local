import { andReduction } from "../../../../helpers/ArrayFunctions"
import { booleanToNumber } from "../../../../helpers/booleanToNumber"
import { BoulevardAppointmentsTableRow } from "../../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow"
import { AutomatedMessageConfigurationEntry } from "../../model/AutomatedMessageConfigurationEntry"

export const filterAppointmentsByModifiers = (
    appointments: BoulevardAppointmentsTableRow[], 
    // criteriaObject: AutomatedMessageConfigurationEntry
    excludeCompleted: boolean = false, 
    onlyCancelled: boolean = false, 
    onlyCompleted: boolean = false, 
    includeCancelled: boolean = false,
    onlyConfirmed: boolean = false,
    excludeConfirmed: boolean = false
): BoulevardAppointmentsTableRow[] => 
    appointments.filter((appointment: BoulevardAppointmentsTableRow): boolean => {
        const { active, completed, cancelled, confirmed } = appointment

        const modifiers = {
            excludeCompleted,
            onlyCancelled, 
            onlyCompleted,
            includeCancelled,
            onlyConfirmed,
            excludeConfirmed
        }

        const modifierKeys = Object.keys(modifiers).filter(key => typeof(modifiers[key]) !== 'undefined')


        if (modifierKeys.length === 0) return true

        const modifierToFilterMap: {[key: number]: {[key: string]: () => boolean}} = {
            0: { // Criteria is disabled
                'excludeCompleted': (): boolean => completed || !completed,
                'onlyCancelled': (): boolean => cancelled || !cancelled,
                'onlyCompleted': (): boolean => completed || !completed,
                'includeCancelled': (): boolean => !cancelled,
                'onlyConfirmed': (): boolean => confirmed || !confirmed,
                'excludeConfirmed': (): boolean => confirmed || !confirmed
            },
            1: { // Criteria is enabled
                'excludeCompleted': (): boolean => !completed,
                'onlyCancelled': (): boolean => cancelled && !completed,
                'onlyCompleted': (): boolean => completed && !cancelled,
                'includeCancelled': (): boolean => cancelled || !cancelled,
                'onlyConfirmed': (): boolean => confirmed,
                'excludeConfirmed': (): boolean => !confirmed
            }
        }

        const results: boolean[] = modifierKeys.reduce((allMatches: boolean[], key: string): boolean[] => {
            const modifier = modifierToFilterMap[booleanToNumber(modifiers[key])][key]

            return [...allMatches, modifier()]
        },[true])


        return andReduction(results)

    })