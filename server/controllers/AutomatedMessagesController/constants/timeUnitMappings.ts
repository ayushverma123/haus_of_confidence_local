import { 
    setYear, 
    setMonth, 
    setDay, 
    setHours, 
    setMinutes, 
    setSeconds, 
    getYear, 
    getMonth, 
    getDay, 
    getHours, 
    getMinutes,
    getSeconds,
    addYears,
    addMonths,
    addWeeks,
    addDays,
    addHours,
    addMinutes,
    addSeconds
} from 'date-fns'
import { TimeUnit } from '../model/AutomatedMessageTimeConfigEntry'

export {}

// export const timeUnitToSetDateFunctionMap: {[key in TimeUnit]: (arg0: Date, value: number) => Date} = {
//     [TimeUnit.Years]: (date: Date, value: number) =>  setYear(date, value!),
//     [TimeUnit.Months]: (date: Date, value: number) => setMonth(date, value!),
//     [TimeUnit.Days]: (date: Date, value: number) => setDay(date, value!),
//     [TimeUnit.Hour]: (date: Date, value: number) => setHours(date, value!),
//     [TimeUnit.Minutes]: (date: Date, value: number) => setMinutes(date, value!),
//     [TimeUnit.Seconds]: (date: Date, value: number) => setSeconds(date, value!)
// }

// export const timeUnitToGetDateFunctionMap: {[key in TimeUnit]: (arg0: Date) => number} = {
//     [TimeUnit.Years]: (date: Date) => getYear(date),
//     [TimeUnit.Months]: (date: Date) => getMonth(date),
//     [TimeUnit.Days]: (date: Date) => getDay(date),
//     [TimeUnit.Hour]: (date: Date) => getHours(date),
//     [TimeUnit.Minutes]: (date: Date) => getMinutes(date),
//     [TimeUnit.Seconds]: (date: Date) => getSeconds(date)
// }

// export const timeUnitAddToDateFunctionMap: {[key in TimeUnit]: (date: Date, value: number) => Date } = {
//     [TimeUnit.Years]: (date: Date, value: number) => addYears(date, value!),
//     [TimeUnit.Months]: (date: Date, value: number) => addMonths(date, value!),
//     [TimeUnit.Days]: (date: Date, value: number) => addDays(date, value!),
//     [TimeUnit.Hour]: (date: Date, value: number) => addHours(date, value!),
//     [TimeUnit.Minutes]: (date: Date, value: number) => addMinutes(date, value!),
//     [TimeUnit.Seconds]: (date: Date, value: number) => addSeconds(date, value!)
// }