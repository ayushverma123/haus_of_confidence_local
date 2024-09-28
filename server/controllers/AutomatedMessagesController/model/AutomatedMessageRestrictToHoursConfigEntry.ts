import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry"

export type AutomatedMessageRestrictToHoursConfigEntry = {
    start: AutomatedMessageTimeConfigEntry,
    end: AutomatedMessageTimeConfigEntry
}