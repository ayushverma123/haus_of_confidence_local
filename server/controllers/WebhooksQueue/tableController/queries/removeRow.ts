import tableName from '../../constants/tableName'

export const removeRow = (id: number) => ({
    text: `DELETE FROM ${tableName} WHERE id = $1`,
    values: [id]
})