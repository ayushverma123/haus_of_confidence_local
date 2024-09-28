import table from '../constants/databaseTable'
import { ScheduledMessageType } from "../model/ScheduledMessageType";

export const alterAlertTimeValueForRow = (contactId: number, type: ScheduledMessageType, alertTime: string) => ({
    text: `UPDATE ${table} SET alert_time = $1 WHERE contact_id = $2 AND type = $3 RETURNING *;`,
    values: [ alertTime, contactId, type ]
})