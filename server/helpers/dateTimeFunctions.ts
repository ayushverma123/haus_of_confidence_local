import { 
    addDays, 
    addHours, 
    addMinutes, 
    addMonths, 
    addSeconds, 
    addWeeks, 
    addYears, 
    format, 
    getDate, 
    getDay, 
    getHours, 
    getMinutes, 
    getMonth, 
    getSeconds, 
    getWeek, 
    getYear, 
    setDate, 
    setHours, 
    setMinutes, 
    setMonth, 
    setSeconds, 
    setMilliseconds,
    getMilliseconds,
    addMilliseconds,
    subMilliseconds,
    setWeek, 
    setYear,
    subDays,
    subHours,
    subMinutes,
    subMonths,
    subSeconds,
    subWeeks,
    subYears
} from 'date-fns'
import { TimeUnit } from '../controllers/AutomatedMessagesController/model/AutomatedMessageTimeConfigEntry'
import { TimeDistanceDirection } from '../controllers/AutomatedMessagesController/model/TimeDistance'

export const turnHoursArrayIntoChosenDateHours = (date: Date, hours: number[]): Date[] => 
    hours.reduce((acc: Date[], cv: number): Date[] => 
        [...acc, setSeconds(setMinutes(setHours(date, cv), 0), 0)], []) as Date[]

export const timeUnitToSetDateValue: {[key in TimeUnit]: (oldDate: Date, value: number) => Date} = {
    [TimeUnit.Years]: (oldDate: Date, value: number) => setYear(oldDate, value), 
    [TimeUnit.Months]: (oldDate: Date, value: number) => setMonth(oldDate, value), 
    // [TimeUnit.Weeks]:  (oldDate: Date, value: number) => oldDate, //! setWeek changes month and day, so it needs to be ignored
    [TimeUnit.Days]: (oldDate: Date, value: number) => setDate(oldDate, value), 
    [TimeUnit.Hour]: (oldDate: Date, value: number) => setHours(oldDate, value), 
    [TimeUnit.Minutes]: (oldDate: Date, value: number) => setMinutes(oldDate, value), 
    [TimeUnit.Seconds]: (oldDate: Date, value: number) => setSeconds(oldDate, value),
    [TimeUnit.Milliseconds]: (oldDate: Date, value: number) => setMilliseconds(oldDate, value)
}

export const addTimeUnitValueToDateMapping: {[key in TimeUnit]: (oldDate: Date, value: number) => Date} = {
    [TimeUnit.Years]: (oldDate: Date, value: number) => addYears(oldDate, value), 
    [TimeUnit.Months]: (oldDate: Date, value: number) => addMonths(oldDate, value), 
    [TimeUnit.Days]: (oldDate: Date, value: number) => addDays(oldDate, value), 
    // [TimeUnit.Weeks]: (oldDate: Date, value: number) => addWeeks(oldDate, value),
    [TimeUnit.Hour]: (oldDate: Date, value: number) => addHours(oldDate, value), 
    [TimeUnit.Minutes]: (oldDate: Date, value: number) => addMinutes(oldDate, value), 
    [TimeUnit.Seconds]: (oldDate: Date, value: number) => addSeconds(oldDate, value),
    [TimeUnit.Milliseconds]: (oldDate: Date, value: number) => addMilliseconds(oldDate, value)
}

export const subtractTimeUnitValueFromDateMapping: {[key in TimeUnit]: (oldDate: Date, value: number) => Date} = {
    [TimeUnit.Years]: (oldDate: Date, value: number) => subYears(oldDate, value), 
    [TimeUnit.Months]: (oldDate: Date, value: number) => subMonths(oldDate, value), 
    // [TimeUnit.Weeks]: (oldDate: Date, value: number) => subWeeks(oldDate, value), 
    [TimeUnit.Days]: (oldDate: Date, value: number) => subDays(oldDate, value), 
    [TimeUnit.Hour]: (oldDate: Date, value: number) => subHours(oldDate, value), 
    [TimeUnit.Minutes]: (oldDate: Date, value: number) => subMinutes(oldDate, value), 
    [TimeUnit.Seconds]: (oldDate: Date, value: number) => subSeconds(oldDate, value),
    [TimeUnit.Milliseconds]: (oldDate: Date, value: number) => subMilliseconds(oldDate, value)
}

export const timeUnitToGetDateFunctionMap: {[key in TimeUnit]: (arg0: Date) => number} = {
    [TimeUnit.Years]: (date: Date) => getYear(date),
    [TimeUnit.Months]: (date: Date) => getMonth(date),
    // [TimeUnit.Weeks]: (date: Date) => getWeek(date),
    [TimeUnit.Days]: (date: Date) => getDate(date),
    [TimeUnit.Hour]: (date: Date) => getHours(date),
    [TimeUnit.Minutes]: (date: Date) => getMinutes(date),
    [TimeUnit.Seconds]: (date: Date) => getSeconds(date),
    [TimeUnit.Milliseconds]: (date: Date) => getMilliseconds(date)
}

export type TimeDistanceDirectionMapping <T,> = {[key in TimeDistanceDirection]: T} 

export const areDatesEqual = (date1: Date, date2: Date): boolean => {
    try {
        const result = date1.toISOString() === date2.toISOString()
        return result
    } catch (error) {
        return false
    }
} 