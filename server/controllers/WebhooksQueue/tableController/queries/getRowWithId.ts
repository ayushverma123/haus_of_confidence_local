import tableName from "../../constants/tableName"

export const getRowWithId = (id: number) => ({
    text: `SELECT * FROM ${tableName} WHERE id = $1`,
    values: [id]
})