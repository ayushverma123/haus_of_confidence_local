import { Id } from "../Id";
import { ServiceConnection } from "./ServiceConnection";

export interface ServiceCategory {
    active: boolean,
    createdAt: string,
    id: Id,
    name: string,
    services: ServiceConnection,
    updatedAt: string
}