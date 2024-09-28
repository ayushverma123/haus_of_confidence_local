import { GeneralContact } from "../../model/GeneralContact"
import { ThirdPartyService } from "../../model/ThirdPartyService"

export const convertSyncedToServicesToThirdPartyServiceArray = (oldContact: GeneralContact): ThirdPartyService[] => 
    Object.keys(oldContact.synced_with_service).reduce((allServices: ThirdPartyService[], serviceKey: string): ThirdPartyService[] => {
        if (typeof(oldContact) === 'undefined') {
            throw new Error("How the FUCK is oldContact undefined here?")
        }
        const syncedWithServiceValues = oldContact.synced_with_service
    
        if (typeof(syncedWithServiceValues) === 'undefined') return allServices
    
        const currentServiceTrue: boolean = syncedWithServiceValues[serviceKey] || false
    
    
        return currentServiceTrue ? [
            ...allServices,
            ThirdPartyService[serviceKey]
        ] : allServices
    }, [])

