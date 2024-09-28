import { ThirdPartyService, ThirdPartyServiceMap } from "../model/ThirdPartyService"
import { getInitialContactImportCompletedValue as getBlvdInitialImportCompletedValue } from "../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import { getPodiumInitialContactSyncCompletedValue } from "../ThirdPartyServices/Podium/stateManager";
import { andReduction } from "./ArrayFunctions";
import { StateProperties } from '../tasks/ContactSync/model/StateProperties'
import { StateStore } from "../controllers/StateManager";

export const getInitialContactImportCompletedValueFunction: ThirdPartyServiceMap<() => Promise<boolean>> = {
    [ThirdPartyService.Boulevard]: getBlvdInitialImportCompletedValue,
    [ThirdPartyService.Podium]: getPodiumInitialContactSyncCompletedValue,
    [ThirdPartyService.GoHighLevel]: async (): Promise<boolean> => new Promise((resolve) => resolve(true)), 
    //[ThirdPartyService.GHL]: async (): Promise<boolean> => new Promise((resolve) => resolve(true)), // Is always true because GHL is not imported
}

export const checkAllContactImportCompletedValues = async (_stateStore): Promise<boolean> => {
    const allServices: string[] = Object.values(ThirdPartyService)

    const defaultForEmpty: ThirdPartyServiceMap<boolean> = allServices.reduce((acc, cv) => ({
        ...acc,
        [ThirdPartyService[cv]]: false
    }), {}) as ThirdPartyServiceMap<boolean>

    try {
    //@ts-ignore
        const contactImportCompletedValues: boolean[] = await allServices.reduce(async (allResults: Promise<boolean[]>, currentServiceValue: string): Promise<boolean[]> => {
            const existingResults: boolean[] = await allResults
            const currentService: ThirdPartyService = ThirdPartyService[currentServiceValue]
            
            try {                
                const checkedValue: boolean = await getInitialContactImportCompletedValueFunction[currentService]()

                //@ts-ignore
                const existingValues = (await _stateStore.getValue<ThirdPartyServiceMap<boolean>>(StateProperties.importedFrom)) || defaultForEmpty

                // console.log("EXISTING VALUES")
                // console.log(existingValues)

                const newValue = {
                    ...existingValues,
                    [currentService]: checkedValue
                }
                
                // @ts-ignore
                await _stateStore.modifyValue<ThirdPartyServiceMap<boolean>>(StateProperties.importedFrom, newValue)
                
                return new Promise((resolve) => resolve([
                    ...existingResults,
                    checkedValue
                ]))
            } catch (error) {
                console.error("CONTACT IMPORT COMPLETED VALUE CHECK ERROR --", currentService)
                console.error(error)
        
                return new Promise((resolve) => resolve(existingResults))
            }
        }, [])

        return new Promise((resolve) => resolve(andReduction(contactImportCompletedValues)))
    } catch (error) {
        console.error("WTF DUDE")
        return new Promise((resolve) => resolve(false))
    }
   
}