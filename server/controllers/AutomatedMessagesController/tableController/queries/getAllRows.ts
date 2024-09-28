import tableName from '../../constants/tableName'

export const getAllRows = (enabledOnly: boolean = true) => ({
    text: `SELECT * FROM ${tableName} 
        ${enabledOnly ? 'WHERE enabled = $1' : ''}
    ;`,
    values: enabledOnly ? [ true ] : []
})