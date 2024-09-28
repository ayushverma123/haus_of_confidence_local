import { AutomatedMessageConfigurationEntry } from "./AutomatedMessageConfigurationEntry"
import { AutomatedMessageLockType } from "./AutomatedMessageLockType"

export type AutomatedMessageLockEntry = {
    id: number,
    automatedMessageId: number,
    automatedMessageConfiguration: AutomatedMessageConfigurationEntry,
    lockType: AutomatedMessageLockType,
    locks: string[],
    lockDate: Date
}


