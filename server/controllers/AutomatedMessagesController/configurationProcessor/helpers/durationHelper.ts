import { Duration } from "date-fns";
import { timeUnitKeys } from "../../model/TimeUnitKeys";
import { TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry";
import { TimeDistanceDirection } from "../../model/TimeDistance";
import { addTimeUnitValueToDateMapping, subtractTimeUnitValueFromDateMapping } from "../../../../helpers/dateTimeFunctions";


export const compareDurations = (a: Duration, b: Duration): Duration => 
    timeUnitKeys.reduce((acc: Duration, key: string) => ({
        ...acc,
        [key]: a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0
    }), {} as Duration)


export const compareDurationTimeUnit = (a: Duration, b: Duration, timeUnit: TimeUnit): number => {
    const durationComparison = compareDurations(a, b)

    return durationComparison[timeUnit]
}

// export const isDurationAGreaterThanDurationB = (desiredGreater: Duration, desiredLower: Duration): boolean => {
//     const durationComparison = compareDurations(desiredLower, desiredGreater)


// }'
const intervalModificationMap: {[key in TimeDistanceDirection]: {[key in TimeUnit]: (oldDate: Date, value: number) => Date}} = {
    [TimeDistanceDirection.Forward]: addTimeUnitValueToDateMapping,
    [TimeDistanceDirection.Backward]: subtractTimeUnitValueFromDateMapping
}

export const applyDurationToDate = (date: Date, direction: TimeDistanceDirection, duration: Duration) => 
    Object.keys(duration).reduce((finalDate: Date, intervalKey: string): Date => 
    // timeUnitKeys.reduce((finalDate: Date, intervalKey: string): Date => 
    // Object.keys(duration).reduce((finalDate: Date, intervalKey: string): Date => 
        intervalModificationMap[direction][intervalKey](finalDate, typeof(duration[intervalKey]) === 'undefined' ? 0 : duration[intervalKey]), date)