import tableName from '../../constants/tableName'
export const updateRowSuccessStatus =  (id: number, success: boolean) => ({
    text: `
        UPDATE ${tableName} 
        SET 
            success = $2
        WHERE id = $1 
        RETURNING *;
    `,
    values: [
        id,
        success,
    ]
})