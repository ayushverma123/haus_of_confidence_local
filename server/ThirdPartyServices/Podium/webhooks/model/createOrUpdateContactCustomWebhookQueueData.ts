import { CreateOrUpdate } from "../../../../model/CreateOrUpdate"

export type CreateOrUpdateContactCustomWebhookQueueData = {
    createOrUpdate: CreateOrUpdate,
    contactData: any,
    forceUpdate?: boolean,
    doNotAlterQueueEntry?: boolean,
}