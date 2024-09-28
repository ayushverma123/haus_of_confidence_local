import { Id } from "../Id";

export interface AppointmentRating {
    id: Id,
    insertedAt: string,
    rating: number,
    text?: string
}