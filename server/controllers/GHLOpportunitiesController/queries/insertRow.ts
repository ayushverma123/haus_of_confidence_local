import { Contact } from '../../../ThirdPartyServices/GoHighLevel/model/Contact'
import { Opportunity } from '../../../ThirdPartyServices/GoHighLevel/model/Opportunity'
import { OpportunityStatus } from '../../../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus'
import tableName from '../constants/tableName'

export const insertRow = (
    status: OpportunityStatus,
    opportunity: Opportunity,
    contact: Contact  
) => ({
    text: `
        INSERT INTO ${tableName} (
            status,
            opportunity,
            ghl_contact_id,
            contact,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `,
    values: [
        status,
        JSON.stringify(opportunity),
        contact.id,
        JSON.stringify(contact),
        new Date().toISOString(),
        new Date().toISOString()
    ]
})