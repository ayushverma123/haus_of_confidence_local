import { format } from "date-fns"
import { addTimeUnitValueToDateMapping, timeUnitToSetDateValue } from "../../../../helpers/dateTimeFunctions"
import { AutomatedMessageTimeConfigEntry, TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry"
import { AutomatedMessageTimeConfigEntryAnalysisResult } from "../../model/AutomatedMessageTimeConfigEntryAnalysisResult"
import { timeUnitKeys } from "../../model/TimeUnitKeys"
import { analyzeAutomatedMessageTimeConfigEntry } from "./analyzeAutomatedMessageTimeConfigEntry"

export const addTimeToDate = async (originalDate: Date, timeToAddEntry: AutomatedMessageTimeConfigEntry): Promise<Date> => {
    const { hasData, data }: AutomatedMessageTimeConfigEntryAnalysisResult = await analyzeAutomatedMessageTimeConfigEntry(timeToAddEntry)


    // console.log(format(originalDate, 'MM/dd/yyyy hh:mm:ss aaa'))

    // console.log(Object.keys(data))
    // console.log(data['hour'])

    const filteredTimeUnitKeys: string[] = Object.keys(data).filter((timeUnit: string) => {
        if (!hasData[timeUnit]) return false
        
        const _data = data[timeUnit]

        if (typeof(_data) === 'undefined') return false

        // const timeUnit = key as TimeUnit


        // if (_data <= 0 && timeUnit !== TimeUnit.Hour && timeUnit !== TimeUnit.Minutes && timeUnit !== TimeUnit.Seconds ) return false

        return true
    })

    // console.log(filteredTimeUnitKeys)

    const newDate: Date = filteredTimeUnitKeys.reduce((acc: Date, key: string): Date => addTimeUnitValueToDateMapping[key](acc, data[key]), originalDate)

    // console.log(format(newDate, 'MM/dd/yyyy hh:mm:ss aaa'))

    return new Promise((resolve) => resolve(newDate))
}