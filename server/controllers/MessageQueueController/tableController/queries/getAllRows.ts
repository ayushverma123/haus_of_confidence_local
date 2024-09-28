import tableName from '../../constants/tableName'

export const getAllRows = () => `SELECT * FROM ${tableName};`