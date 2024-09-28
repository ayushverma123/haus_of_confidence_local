
import tableName from '../../constants/tableName';


export const incrementRetries = (id: number) => ({
    text: `UPDATE ${tableName} SET retries = retries + 1 where id = $1 RETURNING *;`,
    values: [
        id
    ]
})