import tableName from '../constants/tableName'

export const updateRow = (rowId: number, locks: string[]) => ({
    text: `UPDATE ${tableName} SET locks = $1 WHERE id = $2 RETURNING *;`,
    values: [locks, rowId]
})