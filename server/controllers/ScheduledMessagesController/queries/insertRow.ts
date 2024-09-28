import table from '../constants/databaseTable'
import { ScheduledMessageType } from '../model/ScheduledMessageType'

export const insertRow = (
    contactId: number, 
    type: ScheduledMessageType, 
    messageText: string,
    active: boolean = true,
    scheduled_time?: string,
    appointment_id?: number,
    alertTime?: string

) => ({
    text: `
    INSERT INTO ${table} (
        contact_id, 
        type, 
        message_text, 
        active,
        created_at,
        updated_at, 
        ${ typeof(scheduled_time) === 'undefined' ? '' : ', scheduled_time'}),
        ${ typeof(appointment_id) === 'undefined' ? '' : ', appointment_id'}),
        ${ typeof(alertTime) === 'undefined'? '' : ', alert_time'})
    VALUES (
        $1, 
        $2, 
        $3, 
        $4,
        $5,
        $6
        ${typeof(scheduled_time) === 'undefined' ? '' : ',$7'}),
        ${typeof(appointment_id) === 'undefined' ? '' : ',$8'}),
    RETURNING *;`,
    values: [
        contactId, 
        type, 
        messageText, 
        active, 
        (new Date()).toISOString(),
        (new Date()).toISOString(),
        scheduled_time,
        appointment_id,
    ]
})