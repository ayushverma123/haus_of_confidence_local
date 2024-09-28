import { Contact } from "../../ThirdPartyServices/GoHighLevel/model/Contact";
import { Opportunity } from "../../ThirdPartyServices/GoHighLevel/model/Opportunity";
import { OpportunityStatus } from "../../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus";
import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { Maybe } from "../../model/Maybe";
import { GHLOpportunitiesTableRow } from "./model/GHLOpportunitiesTableRow";
import { updateRow } from "./queries/updateRow";

const db = require('../../db')

export const updateGHLOpportunityRow = async (
    id: number, 
    opportunity?: Opportunity, 
    contact?: Contact, 
    status?: OpportunityStatus,
    generalContactId?: number,
): Promise<Maybe<GHLOpportunitiesTableRow>> => {
    try {
        const { rows } = await db.query(updateRow(id, opportunity, contact, status, generalContactId))

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not update GHLOpportunityRow with id: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}