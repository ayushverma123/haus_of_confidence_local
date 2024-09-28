import { timeUnitToSetDateValue } from "../../../../helpers/dateTimeFunctions"
import { AutomatedMessageTimeConfigEntry, TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry"
import { AutomatedMessageTimeConfigEntryAnalysisResult } from "../../model/AutomatedMessageTimeConfigEntryAnalysisResult"
import { timeUnitKeys } from "../../model/TimeUnitKeys"
import { analyzeAutomatedMessageTimeConfigEntry } from "./analyzeAutomatedMessageTimeConfigEntry"
import { removeExcludedTimeUnits } from "./removeExcludedTimeUnits"

export const convertAutomatedMessageTimeConfigEntryToDate = async (entry: AutomatedMessageTimeConfigEntry, excludeUnits: TimeUnit[] = []): Promise<Date> => {
    try {
        const analysisResults: AutomatedMessageTimeConfigEntryAnalysisResult = await analyzeAutomatedMessageTimeConfigEntry(entry)

        // console.log("Analysis results:")
        // console.log(analysisResults)

        const { hasData, data }: AutomatedMessageTimeConfigEntryAnalysisResult = analysisResults

        const filteredTimeUnitKeys: string[] = timeUnitKeys.filter((timeUnit: string) => {
            if (!hasData[timeUnit]) return false
            
            const _data = data[timeUnit]

            if (typeof(_data) === 'undefined') return false

            if (_data <= 0 && timeUnit !== TimeUnit.Hour && timeUnit !== TimeUnit.Minutes && timeUnit !== TimeUnit.Seconds ) return false
            // if (_data <= 0) return false

            return true
        })

        // console.log("FILTERED TIME UNITS")
        // console.log(filteredTimeUnitKeys)

        // const removeExcludedUnits = (acc: Date, key: TimeUnit): Date => timeUnitToSetDateFunctionMap[key](acc, 0)

        const newDate: Date = filteredTimeUnitKeys.reduce((acc: Date, key: string): Date => timeUnitToSetDateValue[key](new Date(acc), data[key]), new Date())
        // console.log("NEW DATE:", newDate)
        const finalDate: Date = removeExcludedTimeUnits(newDate, excludeUnits)
        // console.log("FINAL DATE:", finalDate)

        return new Promise((resolve) => resolve(finalDate))
    } catch (error) { 
        console.error(`Error converting automated message time config entry to date:`)
        console.error(entry)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
