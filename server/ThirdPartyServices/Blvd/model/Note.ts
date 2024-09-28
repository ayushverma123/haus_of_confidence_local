import { Id } from "./Id"

export type Note = {
    createdAt: string, //! DATETIME
    id: Id,
    insertedAt: string, //! DATETIME
    text: string
}