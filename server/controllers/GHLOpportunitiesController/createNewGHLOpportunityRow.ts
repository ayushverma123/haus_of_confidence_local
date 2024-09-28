import { Contact } from "../../ThirdPartyServices/GoHighLevel/model/Contact"
import { Opportunity } from "../../ThirdPartyServices/GoHighLevel/model/Opportunity"
import { OpportunityStatus } from "../../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus"
import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse"
import { GHLOpportunitiesTableRow } from "./model/GHLOpportunitiesTableRow"
import { insertRow } from "./queries/insertRow"

const db = require('../../db')

export const createNewGHLOpportunityRow = async (
    status: OpportunityStatus,
    opportunity: Opportunity,
    contact: Contact
): Promise<GHLOpportunitiesTableRow> => {
    try {
        const { rows } = await db.query(insertRow(status, opportunity, contact))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error('Database returned undefined or null')
        }

        checkForEmptyDatabaseResponse(rows)

        if (rows.length <= 0) {
            throw new Error('Database returned no rows')
        }

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`ERROR: Could not create new GHLOpportunityRow`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}