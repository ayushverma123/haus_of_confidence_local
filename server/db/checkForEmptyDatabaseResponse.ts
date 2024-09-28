import { Maybe } from "../model/Maybe"

export const checkForEmptyDatabaseResponse = (rows: any, errorMessage: Maybe<string> = undefined) => {
    if (Object.is(rows, null) || typeof(rows) === 'undefined') {
        throw new Error(typeof(errorMessage) === 'undefined' ? 'Database returned undefined or null' : errorMessage)
    }
}