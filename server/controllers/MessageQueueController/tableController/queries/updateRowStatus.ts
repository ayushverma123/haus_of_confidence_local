import { MessageStatus } from "../../model/MessageStatus";
import tableName from '../../constants/tableName'

export const updateRowStatus = (id: number, status: MessageStatus) => ({
    text: `UPDATE ${tableName} SET status = $1 where id = $2 RETURNING *;`,
    values: [ status, id ]
})