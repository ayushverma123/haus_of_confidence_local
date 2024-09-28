import { stringifyError } from '../../../../helpers/stringifyError'
import tableName from '../../constants/tableName'
export const updateRowErrorValue =  (id: number, error: Error) => ({
    text: `
        UPDATE ${tableName} 
        SET 
            error = $2
        WHERE id = $1 
        RETURNING *;
    `,
    values: [
        id,
        stringifyError(error),
    ]
})