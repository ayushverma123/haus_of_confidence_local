import table from '../constants/databaseTable'
import { ScheduledMessageType } from '../model/ScheduledMessageType'

export const getRow = (contactId: number, type: ScheduledMessageType) => ({
    text: `
        SELECT 
            sm.contact_id, 
            sm.type, 
            sm.message_text, 
            sm.created_at, 
            sm.updated_at, 
            sm.scheduled_time, 
            sm.active, 
            c.phone_numbers, 
            c.first_name, 
            c.last_name, 
            c.emails 
        FROM ${table} sm 
        JOIN contacts c on c.id = sm.contact_id
        WHERE contact_id = $1 AND type = $2
    ;`,
    values: [
        contactId, 
        type
    ]
})