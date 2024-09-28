import tableName from "../../constants/tableName";

export const getRowWithScheduleName = (scheduleName: string) => ({
    text: `SELECT * FROM ${tableName} WHERE schedule_name = $1;`,
    values: [ scheduleName ]
})