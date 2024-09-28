import { AppRole } from "../AppRole";
import { Id } from "../Id";
import { Location } from '../Location'
import { StaffRole } from "./StaffRole";

export interface Staff {
    active: boolean,
    appRole: AppRole,
    appRoleId?: Id,
    bio?: string,
    createdAt: string,
    displayName: string,
    email?: string,
    externalId?: string,
    externalNickname?: string,
    externallyBookable?: boolean,
    firstName: string,
    id: Id,
    lastName?: string,
    locations: Array<Location>,
    mobilePhone?: string,
    name?: string,
    nickname?: string,
    role: StaffRole,
    staffRoleId: Id,
    updatedAt: string,
}