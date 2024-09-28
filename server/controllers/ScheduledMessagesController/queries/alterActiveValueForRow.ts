import table from '../constants/databaseTable'
import { ScheduledMessageType } from '../model/ScheduledMessageType'

export const alterActiveValueForRow = (contactId: number, type: ScheduledMessageType, activeValue: boolean) => ({
    text: `UPDATE ${table} SET active = $1 WHERE contact_id = $2 AND type = $3 RETURNING *;`,
    values: [activeValue, contactId, type]
})