import { isServiceIdLocked, reduceServiceLockValueByOne } from "../controllers/WebhookLocksController"
import { CreateOrUpdate } from "../model/CreateOrUpdate"
import { ThirdPartyService } from "../model/ThirdPartyService"


export const hasWebhookLock = async (service: ThirdPartyService, createOrUpdate: CreateOrUpdate, id: string): Promise<boolean> => {
    
    // console.log("CHECKING FOR LOCK ON ID:", id)
    
    try {        
        if (await isServiceIdLocked(service, createOrUpdate, id)) {
            // console.log(`${id} is locked`)
            // Service just created / updated a new contact of this ID, ignore and remove lock
            // await reduceServiceLockValueByOne(service, createOrUpdate, id)
    
            return new Promise((resolve) => resolve(true))
        } else return new Promise(resolve => resolve(false))
    } catch (error) {
        console.error(`Could not check for webhook lock for ${service} during Webhook Event`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
