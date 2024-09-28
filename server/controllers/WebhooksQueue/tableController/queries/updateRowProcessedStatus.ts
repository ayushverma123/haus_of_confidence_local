import tableName from '../../constants/tableName'
export const updateRowProcessedStatus =  (id: number, processed: boolean) => ({
    text: `
        UPDATE ${tableName} 
        SET 
            processed = $2
            ${processed ? ',processed_at = $3' : ''} 
        WHERE id = $1 
        RETURNING *;
    `,
    values: [
        id,
        processed,
        processed ? new Date().toISOString() : undefined 
    ]
})