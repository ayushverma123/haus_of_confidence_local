import { getValue, modifyValue } from "../../ContactSync/StateManager";
import { StateProperties } from "../../ContactSync/model/StateProperties";


export const isInitialContactSyncCompleted = async (): Promise<boolean> => {
    const result = await getValue<boolean>(StateProperties.syncCompleted)
    // const result = checkAllContactImportCompletedValues(_stateStore)
    return new Promise((resolve) => resolve(result || false))
}
