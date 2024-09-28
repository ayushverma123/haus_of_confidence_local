import { Id } from "./Id";

export interface Permission {
    description: string,
    enabled: boolean,
    id: Id,
    key: string,
    name: string
}