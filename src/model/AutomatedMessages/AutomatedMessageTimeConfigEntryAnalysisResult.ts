import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry"
import { AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection } from "./AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection"

export type AutomatedMessageTimeConfigEntryAnalysisResult = {
    hasData: AutomatedMessageTimeConfigEntryAnalysisResultHasDateSection,
    data: AutomatedMessageTimeConfigEntry
}