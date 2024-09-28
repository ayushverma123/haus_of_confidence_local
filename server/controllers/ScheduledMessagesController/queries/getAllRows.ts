import table from '../constants/databaseTable'

// export const getAllRows = `SELECT * FROM ${table};`
export const getAllRows = `
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
;`

/* 
SELECT * FROM user_predictions up 
JOIN predictions p ON p.id = up.prediction_id 
LEFT JOIN madden_series ms ON ms.id = p.madden_series 
WHERE up.user_id = $1 AND p.event_id = $2 and p.id = $3;

*/