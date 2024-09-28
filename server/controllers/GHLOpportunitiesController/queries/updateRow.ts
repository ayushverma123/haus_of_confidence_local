import { Contact } from "../../../ThirdPartyServices/GoHighLevel/model/Contact";
import { Opportunity } from "../../../ThirdPartyServices/GoHighLevel/model/Opportunity";
import { OpportunityStatus } from "../../../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus";
import { andReduction, orReduction } from "../../../helpers/ArrayFunctions";
import { generateOptionalColumnNames, generateOptionalInsertData, generateOptionalParameterStrings, generateOptionalQueryUpdateTextSection, generateOptionalValuesData } from "../../../helpers/db/queriesWithOptionalParameters";
import tableName from "../constants/tableName";

export const updateRow = (
    id: number, 
    opportunity?: Opportunity,
    contact?: Contact,
    status?: OpportunityStatus,
    generalContactId?: number,
) => {

    const optionalParametersCheck = [
        typeof(opportunity) !== 'undefined',
        typeof(contact) !== 'undefined',
        typeof(status) !== 'undefined',
        typeof(generalContactId) !== 'undefined'
    ]

    const optionalParametersValues = [
        JSON.stringify(opportunity),
        JSON.stringify(contact),
        status,
        generalContactId
    ]

    const optionalParametersColumnNames = [
        'opportunity',
        'contact',
        'status',
        'general_contact_id'
    ]

    const requiredValues =  [
        id
    ]


    if (!orReduction(optionalParametersCheck)) {
        throw new Error("At least one of opportunity, contact or status is required")
    }

    const optionsValues = generateOptionalValuesData(optionalParametersCheck, optionalParametersValues)


    const optionsQueryText = generateOptionalQueryUpdateTextSection(optionalParametersCheck, optionalParametersColumnNames, requiredValues)

    const query = {
        text: `
            UPDATE ${tableName}
            ${optionsQueryText}
            WHERE id = $1
        RETURNING *;`,
        values: [
            id,
            // @ts-ignore
           ...optionsValues
        ]
    }

    console.log(query)

    return query
}