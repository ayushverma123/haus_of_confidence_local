import tableName from '../../constants/tableName'

export const deleteRow = (id: number) => ({
    text: `DELETE FROM ${tableName} WHERE id = $1`,
    values: [id]
})