import { TagTracker } from "../../../../controllers/StateManager/model/TagTracker";

export type ServiceState = {
    id: string,
    accessToken?: string,
    state?: string,
    refreshToken?: string,
    authToken?: string,
    lastRefresh?: string,
    webhooksRegistered: boolean,
    initialContactSyncCompleted: boolean,
    organizationId: string,
    tagTracker: TagTracker,
}