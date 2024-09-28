import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { Maybe } from "../../model/Maybe";
import { GHLOpportunitiesTableRow } from "./model/GHLOpportunitiesTableRow";
import { getAllRows } from "./queries/getAllRows";
import { getRowById } from "./queries/getRowById";

const db = require('../../db')

export const getGHLOpportunityRowById = async (id: number): Promise<Maybe<GHLOpportunitiesTableRow>> => {
    try {
        const { rows } = await db.query(getRowById(id))

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`ERROR: Could not retrieve all GHLOpportunityRows`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}