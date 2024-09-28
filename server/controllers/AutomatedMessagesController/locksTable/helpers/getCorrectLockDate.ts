import { getYear } from "date-fns"
import { removeExcludedTimeUnits } from "../../configurationProcessor/helpers/removeExcludedTimeUnits"
import { AutomatedMessageLockType } from "../../model/AutomatedMessageLockType"
import { TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry"
import { convertAutomatedMessageTimeConfigEntryToDate } from "../../configurationProcessor/helpers/convertAutomatedMessageTimeConfigEntryToDate"
import { convertDateToAutomatedTimeConfigEntry } from "../../configurationProcessor/helpers/convertDateToAutomatedTimeConfigEntry"

export const getCorrectLockDate = async (lockType: AutomatedMessageLockType, _lockDate: Date): Promise<Date> => {
    const lockTypeToReturnValueMap: { [key in AutomatedMessageLockType]: Date } = {
        [AutomatedMessageLockType.None]: _lockDate,
        [AutomatedMessageLockType.OnceInLifetime]: new Date(0),
        [AutomatedMessageLockType.DailyAppointment]: removeExcludedTimeUnits(_lockDate, [
            TimeUnit.Hour, 
            TimeUnit.Minutes, 
            TimeUnit.Seconds, 
            TimeUnit.Milliseconds
        ]),
        [AutomatedMessageLockType.OncePerAppointment]: new Date(0), // Date of 0 removes date as the deciding factor, now it's only the schedule that is locked
        [AutomatedMessageLockType.OnceYearlyContact]: await convertAutomatedMessageTimeConfigEntryToDate(convertDateToAutomatedTimeConfigEntry(new Date()), [ TimeUnit.Hour, TimeUnit.Minutes, TimeUnit.Days, TimeUnit.Months, TimeUnit.Seconds, TimeUnit.Milliseconds ]
        )
    }
    
    return lockTypeToReturnValueMap[lockType]
}