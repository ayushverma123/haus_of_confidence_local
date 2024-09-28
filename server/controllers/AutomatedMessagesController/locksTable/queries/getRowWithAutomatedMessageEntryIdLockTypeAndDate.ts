import { setDateTimeToStartOfDay } from "../../../../helpers/setDateTimeToStartOfDay";
import { AutomatedMessageLockType } from "../../model/AutomatedMessageLockType";

export const getRowWithAutomatedMessageEntryIdLockTypeAndDate = (automatedMessageId: number, lockType: AutomatedMessageLockType, lockDate: Date) => ({
    text: `SELECT * FROM automated_message_locks WHERE automated_message_schedule = $1 AND lock_type = $2 AND lock_date::date = $3;`,
    values: [automatedMessageId, lockType, setDateTimeToStartOfDay(lockDate)]
})