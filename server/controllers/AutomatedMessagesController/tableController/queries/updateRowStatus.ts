import tableName from '../../constants/tableName'

export const updateRowStatus =  (id: number, rowEnabled: boolean) => ({
    text: `UPDATE ${tableName} SET enabled = $1 WHERE id = $2 RETURNING *`,
    values: [rowEnabled, id]
})