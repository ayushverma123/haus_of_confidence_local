import { isWithinInterval, parseISO } from "date-fns"
import { GeneralContact } from "../../../../../model/GeneralContact"
import { Maybe } from "../../../../../model/Maybe"
import { getAllDatabaseAppointmentsWithContactId } from "../../../../BoulevardAppointmentsTableController/getAllDatabaseAppointmentsWithContactId"
import { BoulevardAppointmentsTableRow } from "../../../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow"
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration"
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject"
import { TimeDistanceDirection, TimeDistanceFrom } from "../../../model/TimeDistance"
import { filterAppointmentsByModifiers } from "../../helpers/filterAppointmentsByModifiers"
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper"
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction"
import { FilterMappingResult } from "../model/FilterMappingResult"
import { TimeUnit } from "../../../model/AutomatedMessageTimeConfigEntry"
import { removeExcludedTimeUnits } from "../../helpers/removeExcludedTimeUnits"
import { areDatesEqual } from "../../../../../helpers/dateTimeFunctions"
import { convertAutomatedMessageTimeConfigEntryToDate } from "../../helpers/convertAutomatedMessageTimeConfigEntryToDate"
import { andReduction, orReduction } from "../../../../../helpers/ArrayFunctions"
import { applyDurationToDate } from "../../helpers/durationHelper"
import { AppointmentService } from "../../../../../ThirdPartyServices/Blvd/model/Appointment/AppointmentService"
import { getDatabaseAppointmentWithId } from "../../../../BoulevardAppointmentsTableController/getDatabaseAppointmentWithId"

const appointmentCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const {
        appointment: appointmentConfig
    } = configDataAnalysisResult

    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Appointment,
        async () => {
            const { hasRequiredData, includes, excludes } = appointmentConfig

            if (!hasRequiredData) {
                throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Appointment} is not configured correctly -- data missing`)
            }

            const { id: contactId } = contact

            if (typeof(contactId) === 'undefined') {
                throw new Error(`Contact does not have an id`) 
            }

            const contactAppointments = await getAllDatabaseAppointmentsWithContactId(contactId)

            if (contactAppointments.length === 0) {
                return new Promise((resolve) => resolve({
                    filterResult: false
                }))
            }

            // TODO
            //? Reduction output needs to be a key-value dictionary of the appointments that matched the criteria
            //? Then, the final output needs to be the AutomatedMessageContactCriteriaAppointmentEntry's appointments property populated with the appointments that matched the criteria

            type _ReductionOutput = {
                appointments: {[key: number]: boolean},
            }

            const reductionFunction = async (acc: Promise<_ReductionOutput>, currentAppointment: BoulevardAppointmentsTableRow): Promise<_ReductionOutput> => {
                const { id: appointmentId } = currentAppointment
                const existing = await acc

                // TODO -- Apply filter stuff to each appointment
                // TODO -- If it all resolves to true, add the appointment to the output

                //@ts-ignore
                const filterReduction = async (filterBoolean: Promise<boolean>, currentEntry: AutomatedMessageContactCriteriaAppointmentEntry): Promise<boolean> => {
                    const existingBooleanResult = await filterBoolean

                    // console.log("EXISTING BOOLEAN RESULT")
                    // console.log(existingBooleanResult)

                    const { timeDistances, tags, services, appointmentInclusionOptions } = currentEntry //currentKey

                    const { 
                        excludeCompleted, 
                        onlyCompleted, 
                        includeCancelled, 
                        onlyCancelled,
                        onlyConfirmed,
                        excludeConfirmed
                    } = appointmentInclusionOptions ?? {}

                    const hasAppointmentInclusionOptions: boolean = typeof(appointmentInclusionOptions) !== 'undefined' || !Object.is(appointmentInclusionOptions, null)
                    const hasExcludeCompleted: boolean = hasAppointmentInclusionOptions ? typeof(excludeCompleted) !== 'undefined' : false
                    const hasOnlyCompleted: boolean = hasAppointmentInclusionOptions ? typeof(onlyCompleted) !== 'undefined' : false
                    const hasIncludeCancelled: boolean = hasAppointmentInclusionOptions ? typeof(includeCancelled) !== 'undefined' : false
                    const hasOnlyCancelled: boolean = hasAppointmentInclusionOptions ? typeof(onlyCancelled) !== 'undefined' : false
                    const hasOnlyConfirmed: boolean = hasAppointmentInclusionOptions? typeof(onlyConfirmed) !== 'undefined' : false
                    const hasExcludeConfirmed: boolean = hasAppointmentInclusionOptions? typeof(excludeConfirmed) !== 'undefined' : false

                    // console.log("CURRENT APPOINTMENT CRITERIA ENTRY")
                    // console.log(currentEntry)

                    // console.log("HAS APPOINTMENT INCLUSION OPTIONS?")
                    // console.log(hasAppointmentInclusionOptions)

                    const hasTimeDistancesCriteria = typeof(timeDistances) !== 'undefined'

                    //? Skips the current appointment if it doesn't match any of the appointment inclusion criteria when there are appointment inclusion criteria
                    if (hasAppointmentInclusionOptions) {
                        // console.log("HAS APPOINTMENT INCLUSION OPTIONS")
                        const relevantAppointments: BoulevardAppointmentsTableRow[] = filterAppointmentsByModifiers(
                            // contactAppointments,
                            [currentAppointment],
                            excludeCompleted, 
                            onlyCancelled,
                            onlyCompleted,
                            includeCancelled,
                            onlyConfirmed,
                            excludeConfirmed
                        )

                        // console.log("RELEVANT APPOINTMENTS")
                        // console.log(relevantAppointments)

                        // //! No appointments match the criteria, so return false
                        if (relevantAppointments.length <= 0) {
                            console.log("NO RELEVANT APPOINTMENTS")
                            
                            return new Promise((resolve) => resolve( false))
                        }    
                    }


                    // TODO
                    //@ts-ignore
                    const timeDistanceResult: boolean = !hasTimeDistancesCriteria ? true : await timeDistances.reduce(async (timeDistanceResults: Promise<boolean>, currentTimeDistanceEntry: TimeDistanceConfiguration): Promise<boolean> => {
                        const existingTimeDistanceResults = await timeDistanceResults

                        const { 
                            distance, 
                            direction, 
                            distanceFrom, 
                            repeat,
                            repeatConfiguration,
                            endRepeat,
                            timeInclusive,
                            specificDate,
                            timeDistanceExclusiveTolerance,
                            excludeTimeUnits: configurationExcludeTimeUnits
                        } = currentTimeDistanceEntry

                        console.log("Current Time Distance Entry: ")
                        console.log(currentTimeDistanceEntry)

                        const hasSpecificDate: boolean = typeof(specificDate) !== 'undefined'
                        const useSpecificDateForDistanceFrom: boolean = distanceFrom === TimeDistanceFrom.SpecificDate && hasSpecificDate

                        if (useSpecificDateForDistanceFrom && !hasSpecificDate) {
                            throw new Error(`Appointment criteria for distanceFrom SpecificDate requires a specificDate configuration`)
                        }

                        
                        const { 
                            years: targetDistanceYears, 
                            months: targetDistanceMonths, 
                            // weeks: targetDistanceWeeks,
                            days: targetDistanceDays,
                            hour: targetDistanceHour, 
                            minutes: targetDistanceMinutes, 
                            seconds: targetDistanceSeconds,
                            milliseconds: targetDistanceMilliseconds
                        } = distance

                        const hasRepeat: boolean = typeof(repeat) !== 'undefined'
                        const hasRepeatConfiguration: boolean = typeof(repeatConfiguration) !== 'undefined'
                        const hasEndRepeat: boolean = typeof(endRepeat) !== 'undefined'
                        const hasTimeInclusive: boolean = typeof(timeInclusive) !== 'undefined'

                        if (hasRepeat && !hasRepeatConfiguration) {
                            throw new Error(`Contact Criteria Appointment configuration must have a repeat configuration if repeat is set to true`) 
                        }

                        const {
                            years: repeatYears,
                            months: repeatMonths,
                            // weeks: repeatWeeks,
                            days: repeatDays,
                            hour: repeatHour,
                            minutes: repeatMinutes,
                            seconds: repeatSeconds,
                            milliseconds: repeatMilliseconds
                        } = repeatConfiguration ?? {}

                        const {
                            direction: endRepeatDirection,
                            endTime: endRepeatTime
                        } = endRepeat ?? {}

                        const {
                            years: endRepeatYears, 
                            months: endRepeatMonths, 
                            // weeks: endRepeatWeeks,
                            days: endRepeatDays,
                            hour: endRepeatHours, 
                            minutes: endRepeatMinutes, 
                            seconds: endRepeatSeconds,
                            milliseconds: endRepeatMilliseconds
                        } = endRepeatTime ?? {}

                        const hasConfigurationExcludeTimeUnits: boolean = typeof(configurationExcludeTimeUnits) !== "undefined" && !Object.is(configurationExcludeTimeUnits, null)

                        const standardAppointmentStartSort = (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow): [Maybe<Date>, Maybe<Date>] => 
                            [typeof(a.appointment_object.startAt) !== 'undefined' 
                                ? parseISO(a.appointment_object.startAt) 
                                : undefined, typeof(b.appointment_object.startAt) !== 'undefined' ? parseISO(b.appointment_object.startAt) : undefined]
                            
                        const sortByDateDescending = (distanceFrom: TimeDistanceFrom) => (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow) => {
                            const mapping: {[key in TimeDistanceFrom]: (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow) => [Maybe<Date>, Maybe<Date>]} = {
                                [TimeDistanceFrom.LastCancelledAppointment]: (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow): [Maybe<Date>, Maybe<Date>] => 
                                    [typeof(a.cancelled_at) !== 'undefined' ? new Date(a.cancelled_at!) : undefined, typeof(b.cancelled_at) !== 'undefined' ? new Date(b.cancelled_at!) : undefined],
                                    // [typeof(a.cancelled_at) !== 'undefined' ? parseISO(a.cancelled_at!) : undefined, typeof(b.cancelled_at) !== 'undefined' ? parseISO(b.cancelled_at!) : undefined],
                                [TimeDistanceFrom.LastCompletedAppointment]: (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow): [Maybe<Date>, Maybe<Date>] => 
                                    [typeof(a.completed_at) !== 'undefined' ? parseISO(a.completed_at!) : undefined, typeof(b.completed_at) !== 'undefined' ? parseISO(b.completed_at!) : undefined],
                                [TimeDistanceFrom.LastOpenAppointment]: standardAppointmentStartSort,
                                [TimeDistanceFrom.NextAppointment]: standardAppointmentStartSort,
                                [TimeDistanceFrom.Now]: (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow): [Maybe<Date>, Maybe<Date>]  => {
                                    throw new Error(`Not Implemented`)
                                },
                                [TimeDistanceFrom.SpecificDate]: (a: BoulevardAppointmentsTableRow, b: BoulevardAppointmentsTableRow): [Maybe<Date>, Maybe<Date>] => {
                                    throw new Error(`Not Implemented`)
                                },
                                [TimeDistanceFrom.EarliestSameDayAppointment]: standardAppointmentStartSort
                            }

                            const [aDate, bDate] = mapping[distanceFrom](a, b)

                            
                            console.group("DATES")
                                console.log("A: " + aDate)
                                console.log("A TYPE:" + typeof(aDate))
                                console.log("B: " + bDate)
                                console.log("B TYPE:" + typeof(bDate))
                            console.groupEnd()
                                
                                // const isoA = (aDate ?? new Date(0)).toISOString()
                                // const isoB = (bDate ?? new Date(0)).toISOString()

                            if (typeof(aDate) === 'undefined' || typeof(bDate) === 'undefined') throw new Error(`Could not compare date: a: ${aDate} -- b: ${bDate}`)

                            const isoA = aDate.toISOString()
                            const isoB = bDate.toISOString()

                            return (isoA ?? 0) > (isoB ?? 0) ? -1 : (isoA ?? 0) < (isoB ?? 0) ? 1 : 0
                        }
                        
                        // Provide the initial date for the distance calculation
                        const initialDateMap: {[key in TimeDistanceFrom]: () => Promise<Maybe<Date>>} = {
                            // filter for cancelled appointments, sort by date descending, return index 0 if applicable
                            [TimeDistanceFrom.LastCancelledAppointment]: async (): Promise<Maybe<Date>> => {
                                const cancelledAppointments = hasAppointmentInclusionOptions ? 
                                    filterAppointmentsByModifiers(
                                        contactAppointments, 
                                        excludeCompleted,
                                        onlyCancelled,
                                        onlyCompleted,
                                        includeCancelled,
                                        onlyConfirmed,
                                        excludeConfirmed
                                    ) : filterAppointmentsByModifiers(contactAppointments, true, true, false, true, false, false)
                                    
                                cancelledAppointments.forEach(({ cancelled_at, id}) => console.log(`ID: ${id}`, cancelled_at))

                                const sortedByDateDescending = cancelledAppointments.sort(sortByDateDescending(TimeDistanceFrom.LastCancelledAppointment))

                                if (sortedByDateDescending.length <= 0) return new Promise((resolve) => resolve(undefined))
                                
                                const firstDescendingAppointment = sortedByDateDescending[0]
                                const [firstDescendingAppointmentId, currentAppointmentId] = [firstDescendingAppointment.id, currentAppointment.id] 

                                if (firstDescendingAppointmentId !== currentAppointmentId) return new Promise((resolve) => resolve(undefined))

                                const cancelledAt = firstDescendingAppointment.cancelled_at
                            
                                if (typeof(cancelledAt) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                console.log("CANCELLED AT: " + cancelledAt)
                                console.log(new Date(`${cancelledAt!}`))
                                console.log(new Date(`${cancelledAt!}`).toISOString())
                                

                                const finalDate = parseISO(new Date(`${cancelledAt!}`).toISOString())

                                // return new Promise((resolve) => resolve(parseISO(cancelledAt)))
                                return new Promise((resolve) => resolve(finalDate))

                            },
                            // filter for appointments that are not completed or cancelled or past their end date, sort by date descending, return index 0 if applicable
                            [TimeDistanceFrom.LastOpenAppointment]: async (): Promise<Maybe<Date>> => {
                                const openAppointments = hasAppointmentInclusionOptions ? 
                                    filterAppointmentsByModifiers(
                                        contactAppointments, 
                                        excludeCompleted,
                                        onlyCancelled,
                                        onlyCompleted,
                                        includeCancelled,
                                        onlyConfirmed,
                                        excludeConfirmed
                                    ) :filterAppointmentsByModifiers(contactAppointments, true, false, false, false, false, false)
                                        .filter(({appointment_object, completed}) => completed && parseISO(appointment_object.endAt) < currentTime)

   
                                
                                const sortedByDateDescending = openAppointments.sort(sortByDateDescending(TimeDistanceFrom.LastOpenAppointment))

                                if (sortedByDateDescending.length <= 0) return new Promise((resolve) => resolve(undefined))

                                const firstDescendingAppointment = sortedByDateDescending[0]
                                const [firstDescendingAppointmentId, currentAppointmentId] = [firstDescendingAppointment.id, currentAppointment.id]

                                if (firstDescendingAppointmentId !== currentAppointmentId) return new Promise((resolve) => resolve(undefined))

                                const endAt = firstDescendingAppointment.appointment_object.endAt

                                if (typeof(endAt) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                return new Promise((resolve) => resolve(parseISO(endAt)))
                            },
                            // filter for completed but not cancelled appointments, sort by date descending, return index 0 if applicable
                            [TimeDistanceFrom.LastCompletedAppointment]: async (): Promise<Maybe<Date>> => {
                                const completedAppointments = hasAppointmentInclusionOptions ? 
                                    filterAppointmentsByModifiers(
                                        contactAppointments, 
                                        excludeCompleted,
                                        onlyCancelled,
                                        onlyCompleted,
                                        includeCancelled,
                                        onlyConfirmed,
                                        excludeConfirmed
                                    )
                                    : filterAppointmentsByModifiers(contactAppointments, false, false, true, false, true, false)
                                
                                // // ! invalid time value debug output stuff
                                // console.log("COMPLETED APPOINTMENTS, JUST THE DATES:")
                                // completedAppointments
                                //     // .filter(({ completed_at}) => typeof(completed_at) !== 'undefined' && completed_at.length > 0)
                                //     .forEach(({completed_at}) => 
                                //         console.log(completed_at))

                                const sortedByDateDescending = completedAppointments.sort(sortByDateDescending(TimeDistanceFrom.LastCompletedAppointment))

                                if (sortedByDateDescending.length <= 0) return new Promise((resolve) => resolve(undefined))

                                const firstDescendingAppointment = sortedByDateDescending[0]
                                const [firstDescendingAppointmentId, currentAppointmentId] = [firstDescendingAppointment.id, currentAppointment.id]

                                if (firstDescendingAppointmentId !== currentAppointmentId) return new Promise((resolve) => resolve(undefined))

                                const completedAt: Maybe<string> = firstDescendingAppointment.completed_at
                                
                                if (typeof(completedAt) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                // console.log("COMPLETED AT DATE: " )
                                // console.log(completedAt!)
                                // console.log(typeof(`${completedAt!}`))

                                const finalDate = parseISO(new Date(`${completedAt!}`).toISOString())

                                // console.log(newDate)
                                // console.log(parseISO(`${completedAt}`))
                                // console.log(parseISO(completedAt!))

                                // return new Promise((resolve) => resolve(parseISO(completedAt)))
                                return new Promise((resolve) => resolve(finalDate))

                            },
                            // filter for all confirmed appointments that are after the current date, return index 0 if applicable
                            [TimeDistanceFrom.NextAppointment]: async (): Promise<Maybe<Date>> => {
                                const futureAppointments = hasAppointmentInclusionOptions ? 
                                    filterAppointmentsByModifiers(
                                        contactAppointments, 
                                        excludeCompleted,
                                        onlyCancelled,
                                        onlyCompleted,
                                        includeCancelled,
                                        onlyConfirmed,
                                        excludeConfirmed
                                    ) : filterAppointmentsByModifiers(contactAppointments, true, false, false, false, false, false)
                                        .filter(item => item.appointment_object.startAt > currentTime.toISOString())
                                    
                                const sortedByDateDescending = futureAppointments.sort(sortByDateDescending(TimeDistanceFrom.NextAppointment))

                                console.log("Future Confirmed Appointments: ")
                                console.log(futureAppointments)
                                
                                if (sortedByDateDescending.length <= 0) return new Promise((resolve) => resolve(undefined))

                                const firstDescendingAppointment = sortedByDateDescending[0]
                                const [firstDescendingAppointmentId, currentAppointmentId] = [firstDescendingAppointment.id, currentAppointment.id]

                                if (firstDescendingAppointmentId !== currentAppointmentId) return new Promise((resolve) => resolve(undefined))

                                const startAt = firstDescendingAppointment.appointment_object.startAt

                                // console.log("START AT VALUE DATE:")
                                // console.log(format(parseISO(startAt), 'yyyy-MM-dd HH:mm:ss'))

                                if (typeof(startAt) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                return new Promise((resolve) => resolve(parseISO(startAt)))
                            },
                            [TimeDistanceFrom.EarliestSameDayAppointment]: async (): Promise<Maybe<Date>> => {
                                const excludedUnits = [TimeUnit.Hour, TimeUnit.Minutes, TimeUnit.Seconds, TimeUnit.Milliseconds]
                            
                                const currentDayDate = removeExcludedTimeUnits(currentTime, excludedUnits)
                                
                                const futureAppointments = hasAppointmentInclusionOptions ? 
                                    filterAppointmentsByModifiers(
                                        contactAppointments, 
                                        excludeCompleted,
                                        onlyCancelled,
                                        onlyCompleted,
                                        includeCancelled,
                                        onlyConfirmed,
                                        excludeConfirmed
                                    ): filterAppointmentsByModifiers(contactAppointments, true, false, false, false, false, false)
                                        .filter(item => areDatesEqual(removeExcludedTimeUnits(parseISO(item.appointment_object.startAt), excludedUnits), currentDayDate))

                                const sortedByDateDescending = futureAppointments.sort(sortByDateDescending(TimeDistanceFrom.EarliestSameDayAppointment))

                                const firstDescendingAppointment = sortedByDateDescending[0]

                                if (typeof(firstDescendingAppointment) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                const [firstDescendingAppointmentId, currentAppointmentId] = [firstDescendingAppointment.id, currentAppointment.id]

                                if (firstDescendingAppointmentId !== currentAppointmentId) return new Promise((resolve) => resolve(undefined))

                                const startAt = firstDescendingAppointment.appointment_object.startAt

                                // console.log("START AT VALUE DATE:")
                                // console.log(format(parseISO(startAt), 'yyyy-MM-dd HH:mm:ss'))

                                if (typeof(startAt) === 'undefined') return new Promise((resolve) => resolve(undefined))

                                return new Promise((resolve) => resolve(parseISO(startAt)))

                            },

                            // Return the date specified in the configuration
                            [TimeDistanceFrom.SpecificDate]: async (): Promise<Maybe<Date>> => await convertAutomatedMessageTimeConfigEntryToDate(specificDate!),
                            [TimeDistanceFrom.Now]: async (): Promise<Maybe<Date>> => currentTime
                        }

                        // const intervalKeys = Object.values(TimeUnit) //['years', 'months', 'days', 'hour', 'minutes', 'seconds']
                        // const intervalModificationMap: {[key in TimeDistanceDirection]: {[key in TimeUnit]: (oldDate: Date, value: number) => Date}} = {
                        //     [TimeDistanceDirection.Forward]: addTimeUnitValueToDateMapping,
                        //     [TimeDistanceDirection.Backward]: subtractTimeUnitValueFromDateMapping
                        // }

                        const intervalKeytoConfigValueMap: {[key in TimeUnit]: Maybe<number>} = {
                            [TimeUnit.Years]: targetDistanceYears, 
                            [TimeUnit.Months]: targetDistanceMonths, 
                            // [TimeUnit.Weeks]: typeof(targetDistanceMonths) === 'undefined' ? targetDistanceWeeks : undefined,
                            [TimeUnit.Days]: targetDistanceDays,
                            [TimeUnit.Hour]: targetDistanceHour, 
                            [TimeUnit.Minutes]: targetDistanceMinutes, 
                            [TimeUnit.Seconds]: targetDistanceSeconds,
                            [TimeUnit.Milliseconds]: targetDistanceMilliseconds
                        } 

                        //! THIS WILL NEED TO INSTEAD BE A GREATER THAN / LESS THAN & EQUAL TO KIND OF THING FOR TIME INCLUSIVE
                        // const normalizeDate = (originalDate: Date) => intervalKeys.reduce((strippedDate: Date, key: string): Date => typeof(intervalKeytoConfigValueMap[key]) !== 'undefined' ? strippedDate : timeUnitToSetDateValue[key](strippedDate, 0), originalDate)
                        // Calculate time distance first, turn it into a date
                        // Normali

                        const _distanceFromDate: Maybe<Date> = await initialDateMap[distanceFrom]()

                        if (typeof(_distanceFromDate) === 'undefined') {
                            // return new Promise((_, reject) => reject(new Error(`Could not calculate time distance -- could not find a date for distance from ${distanceFrom}`)))
                            // SKIP THIS ENTRY
                            // console.error(`Could not find distance from the thing`)
                            return new Promise((resolve) => resolve(andReduction([existingTimeDistanceResults, false])))
                        }

                        const appointmentDate: Date = _distanceFromDate!

                        console.log("Adjusted Appointment Date: " + appointmentDate) 

                        const targetDate: Date = applyDurationToDate(appointmentDate, direction, intervalKeytoConfigValueMap)

                        // console.log("APPOINTMENT DATA")
                        // console.log(appointmentDate)

                        // console.log("APPOINTMENT DATE")
                        // console.log(format(appointmentDate, 'yyyy-MM-dd HH:mm:ss'))

                        // console.log("DATE WITH APPLIED DURATION:")
                        // console.log(format(targetDate, 'yyyy-MM-dd HH:mm:ss'))

                        
                        const hasTimeDistanceExclusiveTolerance: boolean = typeof(timeDistanceExclusiveTolerance) !== 'undefined' && !Object.is(timeDistanceExclusiveTolerance, null)

                        console.log("TARGET DATE")
                        console.log(targetDate)

                        console.log("ATTEMPTING TO PROCESS DATES")
                        const processedDates: [Date, Date] = timeInclusive ? [targetDate, appointmentDate] : hasTimeDistanceExclusiveTolerance 
                            ? [
                                applyDurationToDate(targetDate, TimeDistanceDirection.Backward, timeDistanceExclusiveTolerance?.backward ?? {}), 
                                applyDurationToDate(targetDate, TimeDistanceDirection.Forward, timeDistanceExclusiveTolerance?.forward ?? {})
                            ] 
                            : [targetDate, applyDurationToDate(targetDate, direction, {days: 1})]
                        
                        console.group("PROCESSED DATES")
                        console.log(processedDates)
                        console.groupEnd()

                        // const [earlierDate, laterDate] = (timeInclusive ?? false ? [targetDate, appointmentDate] : [targetDate, applyDurationToDate(targetDate, direction, {days: 1})]).sort((a: Date, b: Date) => {

                        const [earlierDate, laterDate] = processedDates.sort((a: Date, b: Date) => {
                            const aIso = a.toISOString()
                            const bIso = b.toISOString()

                            return aIso < bIso ? -1 : aIso > bIso ? 1 : 0
                        })

                        const timeComparisonInterval = {
                            start: earlierDate,
                            end: laterDate 
                        }


                        // console.log("INTERVAL")
                        // console.log(timeComparisonInterval)

                        // console.log("START DATE", format(timeComparisonInterval.start, 'yyyy-MM-dd HH:mm:ss'))
                        // console.log("END DATE   ", format(timeComparisonInterval.end, 'yyyy-MM-dd HH:mm:ss'))

                        // // console.log(intervalMap[direction]())
                        // // console.log(intervalMap[direction]())

                        // console.log("CURRENT TIME")
                        // console.log(currentTime)

                        const intervalCompareResult = isWithinInterval(currentTime, timeComparisonInterval)

                        // console.log("IS IT NEAR?")
                        // console.log(isWithinInterval(currentTime, intervalMap[direction]()) ? "TRUE" : "FALSE")
                        // console.log(intervalCompareResult ? "TRUE" : "FALSE")

                        // Now compare the targetDate to the currentDate
                        //! The dates are going to need to have all units that are equal to 0 in their distance configuration set to 0, so like if the distance is 2 days, then all values but the DAY value need to be 0, so for the entire day there is a true match

                        // const returnResult = andReduction([isWithinInterval(currentTime, intervalMap[direction]()), existingTimeDistanceResults])
                        const returnResult = andReduction([intervalCompareResult, existingTimeDistanceResults])

                        // console.log("RETURN RESULT:")
                        // console.log(returnResult)

                        return new Promise((resolve) => resolve(returnResult))

                    }, true)


                    const shouldProcessTags: boolean = (() => {
                        if (typeof(tags) === 'undefined') return false
                        return tags.tags.length > 0
                    })()


                    // TODO -- TEST
                    const appointmentTags = (currentAppointment.appointment_object.tags ?? []).map(tag => tag.name) 
                    const hasTags = typeof(tags) !== 'undefined'
                    const tagsToSearch = hasTags ? tags.tags : []

                    //@ts-ignore
                    const tagsResult: boolean = !shouldProcessTags ? true : await tagsToSearch.reduce(async (tagAcc: Promise<boolean>, checkTag: string): Promise<boolean> => {
                        const existingProcessingBoolean = await tagAcc
                        
                        const match: Maybe<boolean> = !hasTags ? undefined : appointmentTags.includes(checkTag)

                        return new Promise((resolve) => resolve(typeof(match) === 'undefined' ? existingProcessingBoolean : andReduction([existingProcessingBoolean, match ])))
                    }, true)

                    const shouldProcessServices: boolean = (() => {
                        if (typeof(services) === 'undefined') return false
                        return services.services.length > 0
                    })()
                    
                    const appointmentServiceNames = (currentAppointment.appointment_object.appointmentServices ?? []).reduce((allServiceNames: string[], currentService: AppointmentService): string[] => 
                        [...allServiceNames, currentService.service.name]
                    ,[])

                    const servicesMatch = !shouldProcessServices ? true : services!.services.reduce((resultBoolean: boolean, currentServiceName: string): boolean => 
                        orReduction([resultBoolean, appointmentServiceNames.includes(currentServiceName)])
                    , false)

                    // console.log("SERVICES MATCH")
                    // console.log(servicesMatch)

                    // const resultBoolean = andReduction([servicesMatch, andReduction([existingBooleanResult, andReduction([timeDistanceResult, tagsResult])])])
                    const resultBoolean = andReduction([existingBooleanResult, servicesMatch, timeDistanceResult, tagsResult])

                    // console.log("ReSuLt BoOlEaN:")
                    // console.log(resultBoolean)

                    return new Promise((resolve) => resolve(resultBoolean))
                }

                // const includesResult: boolean = await (includes ?? []).reduce(filterReduction, true)
                // const excludesResult: boolean = ((await (excludes ?? []).reduce(filterReduction, true)) ?? []).map(item => !item)

                const includesResult: boolean = await ((): Promise<boolean> => {
                    if (typeof(includes) === 'undefined') {
                        // console.error("INCLUDE IS UNDEFINED")
                        return new Promise(resolve => resolve(true))
                    }
                    if (includes.length === 0) {
                        // console.error("INCLUDE IS EMPTY")
                        return new Promise(resolve => resolve(true))
                    }
                    return new Promise((resolve) => resolve(includes.reduce(filterReduction, true)))
                })()

                const excludesResult: boolean = await ((): Promise<boolean> => {
                    if (typeof(excludes) === 'undefined') return new Promise(resolve => resolve(false))
                    if (excludes.length === 0) return new Promise((resolve) => resolve(false))
                    return new Promise((resolve) => resolve(excludes.reduce(filterReduction, true)))
                })()

                // console.log("INCLUDES")
                // console.log(includes)
                // console.log("INCLUDES RESULT")
                // console.log(includesResult)

                // console.log("EXCLUDES RESULT")
                // console.log(excludesResult)

                const finalResult = andReduction([includesResult, !excludesResult])

                // console.log("FINAL RESULT EXCLUDE CONTACTS?")
                // console.log(finalResult)

                return new Promise((resolve) => resolve({
                    ...existing,
                    appointments: {
                        ...existing.appointments,
                        [appointmentId]: finalResult
                    },
                }))

            }

            //@ts-ignore
            const appointmentFilterResults: _ReductionOutput = await contactAppointments.reduce(reductionFunction, {} as _ReductionOutput)

            console.log('Appointment FIlter REsults')
            console.log(appointmentFilterResults)

            const justTrueEntries = (dataObject: {[key: number]: boolean}) => (acc: number[], cv: number): number[] => {

                if (typeof(dataObject[cv]) === 'undefined') return acc

                return dataObject[cv] ? [...acc, cv] : acc
            }
            
            // console.log('HAS INCLUDES?')
            // console.log(includes)

            // console.log("JUST TRUE ENTRIES")
            //@ts-ignore
            console.log(Object.keys(appointmentFilterResults.appointments).reduce(justTrueEntries(appointmentFilterResults.appointments),[]))

            //@ts-ignore
            const appointmentReturn = await Object.keys(appointmentFilterResults.appointments)
                //@ts-ignore
                .reduce(justTrueEntries(appointmentFilterResults.appointments),[])
                //@ts-ignore
                .reduce(async (appointments: Promise<Appointment[]>, appointmentId: string): Promise<Appointment[]> => {
                    const existingAppointments = await appointments

                    try {
                        const appointment = await getDatabaseAppointmentWithId(parseInt(appointmentId))

                        return new Promise((resolve) => resolve([
                            ...existingAppointments,
                            appointment.appointment_object
                        ]))
                    } catch (error) {
                        console.error(`Could not find appointment with id ${appointmentId}`)
                        console.error(error)

                        return new Promise((resolve) => resolve(existingAppointments))
                    }
                }, [])             
            
            // console.log('Appointment Return')
            // console.log(appointmentReturn)

            return new Promise((resolve) => resolve({
                filterResult: appointmentReturn.length > 0,
                excludeContact: appointmentReturn.length <= 0,
                data: {
                    appointments: appointmentReturn
                }
            }))
        }
    )
}

export default appointmentCriteriaProcessor