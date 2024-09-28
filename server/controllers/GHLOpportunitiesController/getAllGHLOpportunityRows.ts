import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { GHLOpportunitiesTableRow } from "./model/GHLOpportunitiesTableRow";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../db')

export const getAllGHLOpportunityRows = async (): Promise<GHLOpportunitiesTableRow[]> => {
    try {
        const { rows } = await db.query(getAllRows)

        checkForEmptyDatabaseResponse(rows)
        
        return new Promise((resolve) => resolve(rows as GHLOpportunitiesTableRow[]))

    } catch (error) {
        console.error(`ERROR: Could not retrieve all GHLOpportunityRows`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}