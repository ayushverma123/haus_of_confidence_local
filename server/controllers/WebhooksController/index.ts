// ThirdPartyService enum will be used as keys for functions to call upon that service's functions lol
// I know what to do 

import { serviceEndpoint } from "../../constants/endpoints";
import JsonContentType from "../../constants/jsonContentType";
import { EndpointType } from "../../model/EndpointType";
import { ThirdPartyService, ThirdPartyServiceMap } from "../../model/ThirdPartyService";
import { WebhookType } from "./model/WebhookType";
import { headerAuthString as PodiumHeaderAuthorizationString } from "../../ThirdPartyServices/Podium/authentication";
import { GeneralWebhookObject, convertServiceWebhookObjectToGeneralWebhookObject } from "./model/GeneralWebhookObject";
import { WebhookObject as PodiumWebhookObject } from "./model/podium/WebhookObject";
import { WebhookResponse as PodiumWebhookResponse } from "./model/podium/WebhookResponse";
import { ServiceWebhookFunctionMap } from "./model/ServiceWebhookFunctionMap";
import { WebhookRequestObject } from "./model/podium/WebhookRequestObject";
import { WebhookRegistrationResponse } from "./model/WebhookRegistrationResponse";
import { AxiosResponse } from "../../model/AxiosResponse";
import { GenericAxiosError } from "../../helpers/AxiosError";
import { webhookReceiverUri } from "../../constants/webhookReceiverUris";
import { generateRandomString } from "../../helpers/RandomStringGenerator";
import { getAllWebhooksForService, getWebhookSecret, updateStoredWebhookObject, updateWebhookSecret } from "./WebhookStateManager";
import { gql } from "graphql-request";
import { CreateWebhookInput } from "./model/boulevard/CreateWebhookInput";
import { gqlClient } from "../../ThirdPartyServices/Blvd/gqlClient";
import { CreateWebhookResponse } from "./model/boulevard/CreateWebhookResponse";
import { Maybe } from "../../model/Maybe";
import {  WebhookResponseItem } from "./model/boulevard/ListWebhooksResponse";
import { eventTypeEnumToBoulevardName } from "./model/boulevard/EventTypeToBoulevardName";
import { boulevardEventTypeToEventType } from "./model/boulevard/BoulevardEventTypeToEventType";
import { getAllGraphQlPages } from "../../helpers/GraphQLPaginationHelper";
import { andReduction } from "../../helpers/ArrayFunctions";
import { getPodiumOrganizationIdValue } from "../../ThirdPartyServices/Podium/stateManager";


const axios = require('axios')


const webhookApiUrl: ThirdPartyServiceMap<string> = {
    [ThirdPartyService.Boulevard]: `${serviceEndpoint[ThirdPartyService.Boulevard][EndpointType.AdminAPI]}`,
    [ThirdPartyService.Podium]: `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/webhooks`,
    [ThirdPartyService.GoHighLevel]: `` // TODO - Not Implemented
}

// TODO - Test Podium
export const listRemoteWebhooks = async (service: ThirdPartyService): Promise<GeneralWebhookObject[]> => {
    const errorMessage = `ERROR: Could not get remote webhooks listing for ${service}`

    const serviceFunction: ThirdPartyServiceMap<() => Promise<GeneralWebhookObject[]>> = {

        //@ts-ignore
        [ThirdPartyService.Boulevard]: async (): Promise<GeneralWebhookObject[]> => {

            try {
                const nodeBody = `
                    createdAt
                    updatedAt
                    id
                    name
                    url
                    subscriptions {
                        id
                        enabled
                        eventType
                    }
                `
                const results = await getAllGraphQlPages<WebhookResponseItem>('webhooks', 100, nodeBody )

                const convertedWebhooks = results.map((item: WebhookResponseItem) => 
                    convertServiceWebhookObjectToGeneralWebhookObject(ThirdPartyService.Boulevard, boulevardEventTypeToEventType[item.subscriptions[0].eventType], item))

                return convertedWebhooks
            } catch(error) {

                console.error(error)
                return new Promise((_, reject) => reject(error))
            }
        },

        // TODO - TEST
        [ThirdPartyService.Podium]: async (): Promise<GeneralWebhookObject[]> => {
            try {
                const result: AxiosResponse = await axios.get(webhookApiUrl[service], {
                    headers: { 
                        ...JsonContentType,
                        ...(await PodiumHeaderAuthorizationString()),
                        },
                })

                if (result.status !== 200) throw GenericAxiosError(result)

                const response: PodiumWebhookResponse = result.data
                const responseWebhooks = response.data
                
                //? For each Webhook Object from Podium, reduce each WebhookType in the current webhook object's eventTypes field into a GeneralWebhookObject 
                const webhooks: GeneralWebhookObject[] = responseWebhooks.reduce((acc: GeneralWebhookObject[], currentWebhookObject: PodiumWebhookObject): GeneralWebhookObject[] => 
                    [
                        ...acc,
                        ...currentWebhookObject.eventTypes.reduce((allWebhooks: GeneralWebhookObject[], currentWebhookEvent: WebhookType): GeneralWebhookObject[] => [
                            ...allWebhooks,
                            {
                                service,
                                type: currentWebhookEvent,
                                createdAt: currentWebhookObject.createdAt,
                                enabled: !currentWebhookObject.disabled,
                                url: currentWebhookObject.url,
                                secret: currentWebhookObject.secret,
                                locationUid: currentWebhookObject.locationUid,
                                updatedAt: currentWebhookObject.updatedAt,
                                organizationUid: currentWebhookObject.organizationUid,
                                uid: currentWebhookObject.uid
                            }
                        ],[])
                    ],[])

                return new Promise((resolve) => resolve(webhooks))

            } catch (error) {
                return new Promise((_, reject) => reject(error))
            }
        },

        [ThirdPartyService.GoHighLevel]: async (): Promise<GeneralWebhookObject[]> => {
            throw new Error('Not Implemented')
        }
    }

    try {
        const result = await serviceFunction[service]()
        return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error(errorMessage)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const listLocalWebhooks = async (service: ThirdPartyService) => await getAllWebhooksForService(service)


// TODO
export const registerWebhook = async <T,> (service: ThirdPartyService, webhookType: WebhookType): Promise<WebhookRegistrationResponse> => {

    const defaultWebhookRegistrationFunction: ThirdPartyServiceMap<(event: WebhookType) => Promise<WebhookRegistrationResponse>> = {
        [ThirdPartyService.Boulevard]: async (event: WebhookType): Promise<WebhookRegistrationResponse> => {

            const eventNameForBlvd: string = eventTypeEnumToBoulevardName[event]
            const webhookName: string = `${ThirdPartyService.Boulevard}.${eventNameForBlvd}`

            const webhookInput: CreateWebhookInput = {
                name: webhookName,
                subscriptions: [{
                    delete: false,
                    eventType: eventNameForBlvd,
                    // id: webhookName,
                    maxRetries: 10
                }],
                url: webhookReceiverUri[service][event]
            } 

            try {
                const query = gql`
                    mutation webhooks($url: String!, $name: String!, $delete: Boolean!) {
                        createWebhook(input: {
                            url: $url
                            name: $name
                            subscriptions: [{
                                delete: $delete
                                eventType: ${eventNameForBlvd}
                                maxRetries: 10
                            }]
                        }) {
                            webhook {
                                id
                                createdAt
                                updatedAt
                                url
                                subscriptions {
                                    id
                                    enabled
                                    eventType
                                }
                            }
                        }
                    }        
                `
                const queryVariables = {
                    'delete': false,
                    'url': webhookInput.url,
                    'name': webhookInput.name,
                }

                const { createWebhook }: CreateWebhookResponse =  await gqlClient().request(query, queryVariables)
                const { webhook } = createWebhook

                const webhookId: Maybe<string> = webhook.id
                
                // console.group("GRAPHQL RESPONSE FOR", eventNameForBlvd)
                // //@ts-ignore
                // console.log(webhookId)
                // console.groupEnd()

                // const { data, errors, status, headers }: GraphQLResponse<CreateWebhookResponse> = graphQlResponse

                // console.log("GRAPHQL RESPONSE STATUS:", status)

                // if (status !== 200) {
                if (typeof(webhookId) === 'undefined') {
                    const errorMessage = `Could not register ${service} ${event} Webhook`
                    throw new Error(errorMessage)
                }

                await updateStoredWebhookObject(ThirdPartyService.Boulevard, event,
                    convertServiceWebhookObjectToGeneralWebhookObject(ThirdPartyService.Boulevard,event, {
                        ...webhook,
                        url: webhookInput.url
                    }) )

                return new Promise((resolve) => resolve(WebhookRegistrationResponse(service, event, false)))

            } catch (error) {
                console.error(error)
                return new Promise((_, reject) => reject(error))
            }
        },
        [ThirdPartyService.Podium]: async (event: WebhookType): Promise<WebhookRegistrationResponse> => {
            const eventTypes: string[] = [event.toString()]
    
            try {
                const secret: string = await (async () => {
                    const result = await getWebhookSecret(ThirdPartyService.Podium, event)
                    if (result === null) {
                        const generatedSecret = generateRandomString(128)
        
                        await updateWebhookSecret(ThirdPartyService.Podium, event, generatedSecret)
    
                        return new Promise((resolve) => resolve(generatedSecret))
                    }
                    return new Promise((resolve) => resolve(result!))
                })()
                
    
                const requestData: WebhookRequestObject = {
                    //@ts-ignore
                    eventTypes,
                    locationUid: process.env.PODIUM_LOCATION_ID,
                    organizationUid: await getPodiumOrganizationIdValue()!,
                    secret: secret,
                    url: webhookReceiverUri[ThirdPartyService.Podium][event]
                }
    
                const result: AxiosResponse = await axios.post(webhookApiUrl[service], requestData,{
                    headers: {
                        ...JsonContentType,
                        ...(await PodiumHeaderAuthorizationString())
                    }
                })
    
                if (result.status !== 200) throw GenericAxiosError(result)
    
                const responseData: PodiumWebhookResponse = result.data
    
                // TODO - store the webhooks in responseData.data in the Webhook database
                await updateStoredWebhookObject(ThirdPartyService.Podium, event, 
                    convertServiceWebhookObjectToGeneralWebhookObject(ThirdPartyService.Podium, event, responseData.data)
                )
    
                const hasError = !result
    
            
                return new Promise((resolve) => resolve(WebhookRegistrationResponse(service, event, hasError)))

            } catch (error) {
                console.error(`ERROR Registering Podium ${event}`)
                console.error(error)
                return new Promise((_, reject) => reject(error))
            }
    
        },
        [ThirdPartyService.GoHighLevel]: async (event: WebhookType): Promise<WebhookRegistrationResponse> => {
            throw new Error('Not Implemented')
        }
    }

    try {

        const result = await defaultWebhookRegistrationFunction[service](webhookType)

        return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error("ERROR REGISTERING WEBHOOKS")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO - Will probably need this to update access tokens for Podium right now - July 21 2023
// TODO - Will need a BoulevardWebhookResponse type in the Promise type as well
export const updateWebhook = async (service: ThirdPartyService, webhookType: WebhookType): Promise<PodiumWebhookResponse | any> => {

    const functionMap: ServiceWebhookFunctionMap<PodiumWebhookResponse> = {
        [ThirdPartyService.Boulevard]: {
            //@ts-ignore
            [WebhookType.ContactCreated]: () => {

            },
            //@ts-ignore
            [WebhookType.ContactDeleted]: () => {

            },
            //@ts-ignore
            [WebhookType.ContactMerged]: () => {

            },
            //@ts-ignore
            [WebhookType.ContactUpdated]: () => {

            }
        },
        [ThirdPartyService.Podium]: {
            // TODO
            //@ts-ignore
            [WebhookType.ContactCreated]: () => {

            },
            // TODO
            //@ts-ignore
            [WebhookType.ContactDeleted]: () => {

            },
            // TODO
            //@ts-ignore
            [WebhookType.ContactMerged]: () => {

            },
            // TODO
            //@ts-ignore
            [WebhookType.ContactUpdated]: () => {

            }
        },
    }
}


// TODO
//@ts-expect-error
export const deleteWebhook = async (service: ThirdPartyService, webhookType?: WebhookType): Promise<boolean> => {

    try {
        
    } catch (error) {

    }
}

// TODO - Podium
export const deleteRemoteWebhook = async (service: ThirdPartyService, id: string): Promise<boolean> => {
    console.log(`Deleting ${id}`)

    const errorMessage = `Could not delete ${service} webhook ${id}`
    const deleteFunction: ThirdPartyServiceMap<() => Promise<boolean>> = {
        [ThirdPartyService.Boulevard]: async (): Promise<boolean> => {
            const query = gql`
                mutation delete($id: String!){
                    deleteWebhook(input: {
                        id: $id
                    }) {
                        webhook {
                            id
                        }
                    }
                }
            `

            try {
                await gqlClient().request(query, { id })
                
                return new Promise((resolve) => resolve(true))

            } catch (error) {
                console.error(errorMessage)
                return new Promise((resolve) => resolve(false))
            }
        },
        // TODO
        //@ts-ignore
        [ThirdPartyService.Podium]: () => {

        }
    }

    try {
        const result = await deleteFunction[service]()

        return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error(errorMessage)
        console.error(error)

        return new Promise((resolve) => resolve(false))
    }
}

export const deleteAllRemoteWebhooks = async (service: ThirdPartyService): Promise<boolean> => {
    const serviceFunction: ThirdPartyServiceMap<() => Promise<boolean>> = {
        [ThirdPartyService.Boulevard]: async (): Promise<boolean> => {
            try {
                const allWebhookIds = (await listRemoteWebhooks(service)).map(({ uid }) => uid)


                //@ts-ignore
                const results: boolean[] = await allWebhookIds.reduce(async (allResults: Promise<boolean[]>, id: string): Promise<boolean[]> => {
                    const existing = await allResults
                    const result = await deleteRemoteWebhook(service, id)

                    return new Promise((resolve) => resolve([
                        ...existing,
                        result
                    ]))
                }, []) 

                return andReduction(results)
            } catch (error) {
                return new Promise((resolve) => resolve(false))
            }
        },
        //@ts-ignore
        [ThirdPartyService.Podium]: async (): Promise<boolean> => {

        },
        [ThirdPartyService.GoHighLevel]: async (): Promise<boolean> => {
            throw new Error('Not Implemented')
        }
    }

    try {
        const result = await serviceFunction[service]()

        return new Promise((resolve) => resolve(result))

    } catch (error) {
        console.error(`Could not delete all remote webhooks for ${service}`)
        console.error(error)

        return new Promise((resolve) => resolve(false))
    }
}
