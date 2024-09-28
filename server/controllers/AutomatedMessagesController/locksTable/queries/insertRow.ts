import { setDateTimeToStartOfDay } from '../../../../helpers/setDateTimeToStartOfDay'
import { AutomatedMessageLockType } from '../../model/AutomatedMessageLockType'
import tableName from '../constants/tableName'

export const insertRow = (automatedMessageScheduleId: number, lockType: AutomatedMessageLockType, lockDate: Date, locks: string[] = []) => ({
    text: `
        INSERT INTO ${tableName} (
            automated_message_schedule, 
            lock_type, 
            locks,
            lock_date
        ) VALUES ($1, $2, $3, $4)
        RETURNING *;`,
    values: [
        automatedMessageScheduleId,
        lockType,
        locks,
        setDateTimeToStartOfDay(lockDate).toISOString()
    ]
})