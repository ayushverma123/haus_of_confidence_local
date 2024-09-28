import { ThirdPartyService } from "../../model/ThirdPartyService"
import { insertRow } from "./queries/insertRow"

const db = require('../../db')

export const addInitialSyncReportEntry = async (sourceService: ThirdPartyService, destinationService: ThirdPartyService, contactObject: any): Promise<boolean> => {
    try {
        const { rows } = await db.query(insertRow(sourceService, destinationService, contactObject))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive newly created row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to newly created intialSyncReportEntry row query was empty')
        }

        return new Promise(resolve => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not create new initialSyncReportEntry row`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}