import { Id } from "./Id";
import { Permission } from "./Permission";

export interface AppRole {
    description: string,
    editable: boolean,
    id: Id,
    name: string,
    permissions: Array<Permission>
}