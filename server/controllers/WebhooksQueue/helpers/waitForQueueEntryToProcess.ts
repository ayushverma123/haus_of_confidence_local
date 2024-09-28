import { Wait } from "../../../helpers/Wait"
import { getWebhookQueueEntryWithId } from "../tableController/getWebhookQueueEntryWithId"

export type WebhookQueueProcessWaitResult = {
    success: boolean,
    error?: any
}

export const waitForQueueEntryToProcess = async (id: number, waitTimeMs: number = 1000): Promise<WebhookQueueProcessWaitResult> => {
    var _isProcessed: boolean = false
    var _success: boolean = true
    var _error: any
    
    try {
        do {
            await Wait(waitTimeMs)
            
            const entry = await getWebhookQueueEntryWithId(id)

            if (typeof(entry) === 'undefined' || Object.is(null, entry)) {
                throw new Error(`Entry not found using ID (${id}) literally just taken from its creation`)
            }

            const { processed, success, error } = entry!

            if (typeof(error) !== 'undefined' && !Object.is(null, error)) {
                throw error
            }

            _isProcessed = processed
            _success = success ?? _success

        } while (!_isProcessed)
    } catch (error) {
        _error = error
        _isProcessed = true
        _success = false
    }

    return new Promise((resolve) => resolve({
        success: _success,
        error: _error
    }))
}