import { registerWebhook } from "."
import { getServiceWebhookRegistrationStatus as getBoulevardWebhooksRegistrationStatus, updateServiceWebhookRegistrationStatus as updateBoulevardWebhooksRegistrationStatus } from "../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager"
import { getPodiumAccessTokenValue, getPodiumInitialContactSyncCompletedValue, getPodiumWebhookCheckCompletedValue, updatePodiumWebhookCheckCompletedValue } from "../../ThirdPartyServices/Podium/stateManager"
import { CronTask, announceToConsole as _announceToConsole, skippingTaskPrefix } from "../../lib/CronTask"
import { ThirdPartyService, ThirdPartyServiceMap } from "../../model/ThirdPartyService"
import { WebhookType, WebhookTypeMap, webhookTypesStrings } from "./model/WebhookType"
import { getInitialContactImportCompletedValueFunction } from "../../helpers/checkAllContactImportCompletedValues"
import { MutexTypes, getMutex, modifyMutex } from "../MutexController"
import { getWebhookRegisteredStatus, updateWebhookRegisteredStatus } from "./WebhookStateManager"
import { WebhookRegistrationResponse } from "./model/WebhookRegistrationResponse"
import { checkEnvBooleanValue } from "../../helpers/envFunctions"
import { andReduction } from "../../helpers/ArrayFunctions"
import { getGHLWebhooksRegistrationStatus, updateGHLWebhooksRegistrationStatus } from "../../ThirdPartyServices/GoHighLevel/stateManager"
import { excludeWebhookEventRegistrationForService } from "./constants/excludeWebhookEventRegistrationForService"

const isSyncCompleted = require("../../tasks/oneTimeContactSyncTask").isSyncCompleted

export const generateWebhooksMaintenanceTask = (service: ThirdPartyService, taskName: string, cronInterval: string) => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)
    const webhookRegistrationReductionFunction: (service: ThirdPartyService) => (arg0: Promise<WebhookRegistrationResponse[]>, arg1: WebhookType) => Promise<WebhookRegistrationResponse[]> = 
        (service: ThirdPartyService) => async (allResults: Promise<WebhookRegistrationResponse[]>, webhookEvent: WebhookType): Promise<WebhookRegistrationResponse[]> => {
        
        const existingResults = await allResults
        try {
            if (await getWebhookRegisteredStatus(service, webhookEvent)) {
                announceToConsole(`Skipping webhook registration for ${webhookEvent} because it is already registered`)
                const result = await allResults
                return new Promise((resolve) => resolve(result))
            }

            if (excludeWebhookEventRegistrationForService[service][webhookEvent]) {
                return new Promise((resolve) => resolve(allResults))
            }

            const result = await registerWebhook(service, webhookEvent)

            const returnValue = [
                ...existingResults,
                result
            ]

            return new Promise((resolve) => resolve(returnValue))
            
        } catch (error) {
            console.error(`Error registering webhook ${webhookEvent}`)
            console.error(error)

            const parseError: ThirdPartyServiceMap<(error: any) => string> = {
                [ThirdPartyService.Boulevard]: (error: any) => 
                    error.response.errors.reduce((allErrors: string, currentError: any, index: number, array: any[]) => 
                        `${allErrors}${currentError.message}${index >= array.length - 1 ? "" : "\n" }`, ""),
                [ThirdPartyService.Podium]: (error: any) =>{
                    console.log(error)
                    return error as string
                },
                // TODO
                [ThirdPartyService.GoHighLevel]: (error: any) => {
                    throw new Error('Not Implemented')
                }
            }
    
            const errorResponse: WebhookRegistrationResponse = {
                service,
                webhook: webhookEvent,
                hasError: true,
                errorMessage: parseError[service](error),
                successful: false,
            }
    
            const returnValue = [
                ...existingResults,
                errorResponse
            ]
    
            return new Promise((resolve) => resolve(returnValue))
        }
    }

    return CronTask(cronInterval, taskName, async() => {
        const mutexType = MutexTypes.WebhookCheck
        
        const lockMutex = async () => await modifyMutex(service, mutexType, true)
        const unlockMutex = async () => await modifyMutex(service, mutexType, false)

        //Check for access token
        if (service === ThirdPartyService.Podium) {
            if (!await getPodiumAccessTokenValue()) {
                announceToConsole(`No ${service} access token found, skipping webhook registration`)
    
                return
            }
        }

        // Check that contacts have been imported already
        const allServices = Object.values(ThirdPartyService)

        type _serviceCheck = {
            service: ThirdPartyService,
            result: boolean
        }

        //@ts-ignore
        const _servicesCompleted: _serviceCheck[] = await allServices.reduce(async (allResults: Promise<_serviceCheck[]>, currentService: string): Promise<_serviceCheck[]> => {
            const existingResults: _serviceCheck[] = await allResults
            const service: ThirdPartyService = ThirdPartyService[currentService]

            const result: boolean = await getInitialContactImportCompletedValueFunction[service]()

            return new Promise((resolve) => resolve([
                ...existingResults,
                {
                    service,
                    result
                }
            ]))
        },[])

        const allServicesCompleted = andReduction(_servicesCompleted.map(({ result }) => result))

        if (!allServicesCompleted) {
            announceToConsole(`${skippingTaskPrefix}`)
            _servicesCompleted.filter(({ result }) => !result).forEach(({ service }) => {
                announceToConsole(`Contact Import for ${service} has not been completed`)
            })
            return
        }


        if (!await isSyncCompleted()) {
            announceToConsole(`${skippingTaskPrefix} One-Time Contact Sync has not been completed`)

            return
        }

        const alreadyCompletedCheckFunction: ThirdPartyServiceMap<() => Promise<boolean>> = {
            //@ts-ignore
            [ThirdPartyService.Boulevard]: getBoulevardWebhooksRegistrationStatus,
            [ThirdPartyService.Podium]: getPodiumWebhookCheckCompletedValue,
            [ThirdPartyService.GoHighLevel]: getGHLWebhooksRegistrationStatus
        } 


        // Check that webhooks aren't already registered
        if (await alreadyCompletedCheckFunction[service]()) {
            announceToConsole(`Webhooks already registered for ${service}, skipping webhook registration`)

            // Already Registered
            return
        }

        // Check for mutex
        if (!await getMutex(service, mutexType)) {
            try {
                // Set mutex to true
                await lockMutex()

                // Register webhooks
                //@ts-ignore
                const registrationResults: WebhookRegistrationResponse[] = await webhookTypesStrings.reduce(webhookRegistrationReductionFunction(service), [])

                const successes: WebhookRegistrationResponse[] = registrationResults.filter(({ successful, hasError }) => successful && !hasError )
                const failures: WebhookRegistrationResponse[] = registrationResults.filter(({ successful, hasError }) =>!successful || hasError )

                // const hasSuccess = successes.length > 0
                const hasFailures = failures.length > 0

                const allSuccess = successes.length === registrationResults.length
                const allFailures = failures.length === registrationResults.length

                if (checkEnvBooleanValue(process.env.VERBOSE)) {
                    if (successes.length > 0) {
                        console.group(`Successfully registered ${successes.length} webhooks with ${service}`)
                            successes.forEach(({ service, webhook }) => console.log(`Registered Webhook\n    Service: ${service}\n    Webhook: ${webhook}`))
                        console.groupEnd()
                    }

                    if (failures.length > 0) {
                        console.group(`Failed to register ${failures.length} webhooks with ${service}`)
                            failures.forEach(({ service, webhook, errorMessage }) => 
                                console.log(`Failed to register Webhook\n    Service: ${service}\n    Webhook: ${webhook}\n    Error: ${errorMessage}`))
                        console.groupEnd()
                    }
                }

                // TODO - Handle the registration results so it can attempt failed webhook registrations again
                if (hasFailures) {
                    //TODO  - Handle failures... Eventually
                    // Retry failed registrations until they all succeed
                }

                // Set the registered / success status for each webhook, then if they all succeed, set the registered value to true in StateStore
                successes.forEach(({ service, webhook }) => {
                    updateWebhookRegisteredStatus(service, webhook, true)
                })

                const updateCompletedValueFunctions: ThirdPartyServiceMap<(arg0: boolean) => Promise<boolean>> = {
                    //@ts-ignore
                    [ThirdPartyService.Boulevard]: updateBoulevardWebhooksRegistrationStatus,
                    [ThirdPartyService.Podium]: updatePodiumWebhookCheckCompletedValue,
                    [ThirdPartyService.GoHighLevel]: updateGHLWebhooksRegistrationStatus
                }

                // Set completed to true
                if (allSuccess) {
                    updateCompletedValueFunctions[service](true)
                } 

                // Set mutex to false
                await unlockMutex()  
            } catch (error) {
                console.error("Error registering webhooks")
                console.error(error)

                // Set mutex to false
                await unlockMutex()

            }
        }
    })
}
