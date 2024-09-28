import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { GeneralContact } from "../../model/GeneralContact";
import { Maybe } from "../../model/Maybe";
import tableName from "./constants/tableName";

const db = require('../../db')

export type FindContactInput = {
    email?: string,
    phoneNumber?: string,
    firstName?: string,
    lastName?: string,
}

type _Check_FindContactInput = {
    hasEmail: boolean,
    hasPhoneNumber: boolean,
    hasFirstName: boolean,
    hasLastName: boolean,
}

const checkForCriteria = (input: FindContactInput): _Check_FindContactInput  => {
    const { email, phoneNumber, firstName, lastName } = input

    const hasEmail = typeof(email) !== 'undefined' && !Object.is(email, null)
    const hasPhoneNumber = typeof(phoneNumber) !== 'undefined' && !Object.is(phoneNumber, null)
    const hasFirstName = typeof(firstName) !== 'undefined' && !Object.is(firstName, null)
    const hasLastName = typeof(lastName) !== 'undefined' && !Object.is(lastName, null)

    if (!hasEmail &&!hasPhoneNumber &&!hasFirstName &&!hasLastName) {
        throw new Error("No search criteria provided")
    }

    return {
        hasEmail,
        hasPhoneNumber,
        hasFirstName,
        hasLastName
    }
}

const query = (input: FindContactInput) => {
    const { email, phoneNumber, firstName, lastName } = input
    const { 
        hasEmail,
        hasPhoneNumber,
        hasFirstName,
        hasLastName 
    } = checkForCriteria(input)

    return {
        text: `
            SELECT * FROM ${tableName}
            WHERE 
            ${ hasFirstName ? `"first_name" ILIKE '%${ firstName}%'` : ''}
            ${ hasFirstName && hasLastName ? 'AND' : ''} ${ hasLastName ? `"last_name" ILIKE '%${lastName}%'` : ''}
            ${ hasLastName && hasEmail ? 'AND' : ''} ${ hasEmail ? `"emails"::TEXT ILIKE '%${email}%'`  : '' }
            ${ hasEmail && hasPhoneNumber? 'AND' : ''} ${ hasPhoneNumber? `"phone_numbers"::TEXT ILIKE '%${phoneNumber}%'` : '' }
        ;`
    }
}

/*
WHERE ("first_name" ILIKE '%Test%') 
    AND ("last_name" ILIKE '%Testman%') 
'%eric@tomasso.tech%'
*/

export const findGeneralContact = async (contactSearchCriteria: FindContactInput): Promise<Maybe<GeneralContact>> => {
    try {
        checkForCriteria(contactSearchCriteria)

        console.log("QUERY")
        console.log(query(contactSearchCriteria))
        
        const { rows } = await db.query(query(contactSearchCriteria))

        checkForEmptyDatabaseResponse(rows)

        if (rows.length > 1) {
            throw new Error("More than one contact found")
        }

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Error when trying to find general contact`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}