import { isWithinInterval, setHours, setMilliseconds, setMinutes, setSeconds, setYear } from "date-fns"
import { GeneralContact } from "../../../../../model/GeneralContact"
import { TimeUnit } from "../../../model/AutomatedMessageTimeConfigEntry"
import { removeExcludedTimeUnits } from "../../helpers/removeExcludedTimeUnits"
import { getGeneralContactDateOfBirth } from "../../../../GeneralContactsController/getGeneralContactDateOfBirth"
import { areDatesEqual } from "../../../../../helpers/dateTimeFunctions"
import { AutomatedMessageSpecificDateConfigurationEntry } from "../../../model/AutomatedMessageSpecificDate"
import { andReduction } from "../../../../../helpers/ArrayFunctions"
import { applyDurationToDate } from "../../helpers/durationHelper"
import { TimeDistanceDirection } from "../../../model/TimeDistance"
import { convertAutomatedMessageTimeConfigEntryToDate } from "../../helpers/convertAutomatedMessageTimeConfigEntryToDate"

export const handleSpecificDateConfigurations = async ( currentTime: Date, dateConfig, isBirthdate: boolean, contact: GeneralContact) => {
    const { hasRequiredData, includes, excludes } = dateConfig

    // if (!hasRequiredData) {
    //     throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Tags} is not configured correctly -- data missing`)
    // }
    
    const excludedUnits: TimeUnit[] = isBirthdate ? [TimeUnit.Years, TimeUnit.Seconds, TimeUnit.Hour, TimeUnit.Minutes, TimeUnit.Milliseconds]
        : [TimeUnit.Years, TimeUnit.Hour, TimeUnit.Seconds, TimeUnit.Milliseconds]

    const adjustedCurrentTime = setYear(removeExcludedTimeUnits(currentTime, excludedUnits), 0)


    type _ReductionOutput = {
        result: boolean, 
        birthday?: Date
    }

    const defaultObject = {
        result: true
    }

    const contactBirthday = isBirthdate ? await getGeneralContactDateOfBirth(contact) : undefined

    // console.log("contactBirthday")
    // console.log(contactBirthday)

    if ((typeof(contactBirthday) === 'undefined' || Object.is(contactBirthday, null)) && isBirthdate) {
        return new Promise((resolve) => resolve({
            filterResult: false
        }))

    }

    const adjustedBirthday = isBirthdate ? removeExcludedTimeUnits(contactBirthday!, excludedUnits) : undefined

            
    const birthdateOrAdjustedCurrent: Date = isBirthdate ? adjustedBirthday! : removeExcludedTimeUnits(currentTime, excludedUnits)

    const hasIncludes = (() => {
        if (typeof(includes) === 'undefined' || Object.is(includes, null)) {
            return false
        }
        if (includes.length === 0) {
            return false
        }
        return true
    })()

    const hasExcludes = (() => {
        if (typeof(excludes) === 'undefined' || Object.is(excludes, null)) {
            return false
        }
        if (excludes.length === 0) {
            return false
        }
        return true
    })()

    const compareBirthdays = (contactBirthday: Date, matchDate: Date) => areDatesEqual(matchDate, contactBirthday)

    const reductionFunction = async (acc: Promise<_ReductionOutput>, currentEntry: AutomatedMessageSpecificDateConfigurationEntry): Promise<_ReductionOutput> => {
        if (typeof(birthdateOrAdjustedCurrent) === 'undefined') {
            return new Promise((resolve) => resolve({
                result: andReduction([ existing.result, false])
            }))
        }

        const existing = await acc
        const { timeDistance, date: _date } = currentEntry

        const hasDateEntry: boolean = typeof(_date) !== 'undefined' && !Object.is(_date, null) 

        if (!isBirthdate && !hasDateEntry) {
            throw new Error("SpecificDate entries must have at least one date entry")
        }
        
        //@ts-ignore
        //? Adjusts the month by subtracting 1 from the user-input number, since months are 0-indexed
        const entryTargetDate: Date = removeExcludedTimeUnits(!isBirthdate ? await convertAutomatedMessageTimeConfigEntryToDate(Object.keys(_date).reduce((acc, cv) => {
            const value = _date[cv]

            if (typeof(value) === 'undefined' || Object.is(value, null)) return acc

            return {
                ...acc,
                [cv]: cv === TimeUnit.Months ? _date[cv]! - 1 : _date[cv]
            }
        }, {}), excludedUnits) :  _date, excludedUnits)

        const dateToUse = isBirthdate ? birthdateOrAdjustedCurrent : entryTargetDate

        // const date = await convertAutomatedMessageTimeConfigEntryToDate(_date, excludedUnits)
        const hasTimeDistance = typeof(timeDistance) !== 'undefined' && !Object.is(timeDistance, null)

        const { direction, distance, timeDistanceExclusiveTolerance, timeInclusive } = timeDistance?? {}

        // TODO -- There's an error in here somewhere with the duration value being undefined sometimes
        // TODO --- ERROR IS RELATED TO applyDurationToDate
        const targetDate = hasTimeDistance ? 
            applyDurationToDate(dateToUse, direction!, distance!)
            : dateToUse

        const justMatchDate = !hasTimeDistance && hasDateEntry && !isBirthdate 
        const excludeAllButJustTheDate = [
            TimeUnit.Milliseconds,
            TimeUnit.Seconds,
            TimeUnit.Minutes,
            TimeUnit.Hour,
            TimeUnit.Years
        ]

        console.log("BIRTHDATE OR ADJUSTED CURRENT DATE:", birthdateOrAdjustedCurrent)
        console.log("TARGET DATE:", targetDate)

        const hasTimeDistanceExclusiveTolerance: boolean = typeof(timeDistanceExclusiveTolerance) !== 'undefined' && !Object.is(timeDistanceExclusiveTolerance, null)

        // const processedDates: [Date, Date] = timeInclusive ? [targetDate, dateToUse] : hasTimeDistanceExclusiveTolerance 
        const processedDates: [Date, Date] = 
            !justMatchDate ? 
                timeInclusive ? [targetDate, dateToUse] : 
                    hasTimeDistanceExclusiveTolerance ? 
                        [
                            applyDurationToDate(targetDate, TimeDistanceDirection.Backward, timeDistanceExclusiveTolerance?.backward ?? {}), 
                            applyDurationToDate(targetDate, TimeDistanceDirection.Forward, timeDistanceExclusiveTolerance?.forward ?? {})
                        ] 
                    : [targetDate, applyDurationToDate(targetDate, direction!, {days: 1})]
            : (() => {
                const adjustedDate = setHours(removeExcludedTimeUnits(targetDate, excludeAllButJustTheDate), 0)

                const dates: [Date, Date] = [adjustedDate, setMilliseconds(setSeconds(setMinutes(setHours(adjustedDate, 23), 59), 59), 999)]
                console.log("JUST MATCH DATES:")
                console.log(dates)

                return dates
            })()

        // console.log("PROCESSED DATES")
        // console.log(processedDates)


        const [earlierDate, laterDate] = processedDates.sort((a: Date, b: Date) => {
            const aIso = a.toISOString()
            const bIso = b.toISOString()

            return aIso < bIso ? -1 : aIso > bIso ? 1 : 0
        })

        const timeComparisonInterval = {
            start: removeExcludedTimeUnits(earlierDate, excludedUnits),
            end: removeExcludedTimeUnits(laterDate, excludedUnits) 
        }

        console.log("INTERVAL")
        console.log(timeComparisonInterval)

        // console.log("START DATE", format(timeComparisonInterval.start, 'yyyy-MM-dd HH:mm:ss'))
        // console.log("END DATE   ", format(timeComparisonInterval.end, 'yyyy-MM-dd HH:mm:ss'))

        console.log("CURRENT TIME")
        console.log(adjustedCurrentTime)

        const intervalCompareResult = isWithinInterval(adjustedCurrentTime, timeComparisonInterval)

        console.log("IS IT NEAR?")

        console.log(intervalCompareResult ? "TRUE" : "FALSE")

        // const returnResult = andReduction([ existing.result, compareBirthdays(adjustedBirthday, targetDate)])
        const returnResult = andReduction([ existing.result, intervalCompareResult])

        // console.log("RETURN RESULT:")
        // console.log(returnResult)

        return new Promise((resolve) => resolve({
            result: returnResult,
        }))
    }

    const includesResult: _ReductionOutput = hasIncludes ? await ((): Promise<_ReductionOutput > => {
        return new Promise((resolve) => resolve(includes.reduce(reductionFunction, defaultObject)))
    })() : {result: true}

    const excludesResult: _ReductionOutput = hasExcludes ? await ((): Promise<_ReductionOutput > => {
        return new Promise((resolve) => resolve(excludes.reduce(reductionFunction, defaultObject)))
    })() : {result: false}

    const justMatchBirthdate: boolean = !hasIncludes && !hasExcludes
    const justMatchBirthdateResult = 
        justMatchBirthdate ? 
            isBirthdate ? 
                compareBirthdays(adjustedBirthday ?? new Date(0,0,0,0,0,0,0), setYear(adjustedCurrentTime,0))
                : false
        : undefined

    return new Promise((resolve) => resolve({
        filterResult: isBirthdate && justMatchBirthdate ? justMatchBirthdateResult! : andReduction([includesResult.result, !excludesResult.result]),
        data: isBirthdate && typeof(contactBirthday) !== 'undefined' ? {
            date: contactBirthday
        } : undefined
    } ))
}