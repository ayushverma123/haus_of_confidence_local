import { AutomatedMessageTimeConfigEntry, TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry"
import { AutomatedMessageTimeConfigEntryAnalysisResult } from "../../model/AutomatedMessageTimeConfigEntryAnalysisResult"
import { AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection } from "../../model/AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection"

export const analyzeAutomatedMessageTimeConfigEntry = async (entry: AutomatedMessageTimeConfigEntry): Promise<AutomatedMessageTimeConfigEntryAnalysisResult> => {
    try {
        const keys: string[] = Object.values(TimeUnit)

        // Check if entry has each of the keys

        //@ts-ignore
        const hasData: AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection = keys.reduce((acc: AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection, key: string): AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection => ({
            ...acc,
            [key]: typeof(entry[key]) !== 'undefined'
        }), {})

        //@ts-ignore
        const data: AutomatedMessageTimeConfigEntry = keys.reduce((acc: AutomatedMessageTimeConfigEntry, key: string): AutomatedMessageTimeConfigEntry => ({
            ...acc,
            [key]: hasData[key] ? entry[key] : undefined
        }), {})

        return new Promise((resolve) => resolve({
            hasData,
            data
        }))

    } catch (error) {
        console.error(`Error analyzing automated message time config entry:`)
        console.error(entry)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}