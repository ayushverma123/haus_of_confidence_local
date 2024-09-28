import { AutomatedMessageLockType } from "../../model/AutomatedMessageLockType"

export type AutomatedMessageLocksTableRow = {
    id: number,
    automated_message_schedule: number,
    lock_type: AutomatedMessageLockType,
    locks: string[],
    lock_date: string
}