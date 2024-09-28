import { serviceEndpoint } from "../../../../constants/endpoints";
import { getAllGraphQlPages } from "../../../../helpers/GraphQLPaginationHelper";
import { EndpointType } from "../../../../model/EndpointType";
import { Maybe } from "../../../../model/Maybe";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { generateAuthenticationString } from "../../authentication";
import { gqlClient } from "../../gqlClient";
import { Client, graphQlBody as graphQlClientBody } from "../../model/Client";
import { Id } from "../../model/Id";
import { request, gql, GraphQLClient } from 'graphql-request'
import { Tag } from "../../model/Tag";
import { createNewTag } from "../TagsController";
import { andReduction } from "../../../../helpers/ArrayFunctions";
import { _stateStore as BoulevardState, getStateObject, getTagTracker, updateTagTracker } from "../../StateManager/BlvdStateManager";
import { TagTracker } from "../../../../controllers/StateManager/model/TagTracker";
import { emailRegex, getNumberWithMillisecondsUnit } from "../../../../helpers/commonRegex";
import emptyName from '../../../../constants/emptyName'
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController";
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate";
import { Wait } from "../../../../helpers/Wait";
// Is a function and not an object because the authentication string needs to be different every. single. second.


const service: ThirdPartyService = ThirdPartyService.Boulevard

export const getClientInfoUsingId = async (id: Id): Promise<Maybe<Client>> => {
    const query = gql`
        query getClient($id: ID!) {
            client(id: $id) {
                ${graphQlClientBody}
            }
        }
    `
    const variables = { id }

    try {
        const { client } = await gqlClient().request<{client:Client}>(query, variables)

        return new Promise((resolve) => resolve(client))

    } catch (error) {
        console.error(`Could not get ${service} client, id: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getAllClients = async (): Promise<Client[]> => {      
    try {
        const nodeBody = graphQlClientBody
        const clients = await getAllGraphQlPages<Client>('clients', 100, nodeBody )

        return new Promise((resolve) => resolve(clients))

    } catch (error) {
        console.log("Could not get Boulevard clients")
        console.log(error)

        return  new Promise((_, reject) => reject(error))
    }
}

//? Will update if provided with contactId
//? Will create if no contactId is provided
export const createOrUpdateClient = async (client: Client, contactId: Maybe<Id> = undefined): Promise<Client> => { 

    const { tags } = client

    // Eliminate tags that have an ID field for some reason
    // (these are supposed to be just tag names and addTagsToClient is supposed to determine if it exists already or not, not this, but I'm gonna check anyway)
    const tagsWithNoId = (tags || []).filter(({ id }) => typeof(id) === 'undefined' )

    const needsTagsCreated = (() => {
        if (typeof(tags) !== 'undefined') {
            if (tagsWithNoId.length > 0) return true
            return false
        }
        return false
    })()


    const { dob, email, externalId, firstName, lastName, mobilePhone, pronoun } = client

    // const hasContactId = typeof(client.id) !== 'undefined'
    const hasContactId = typeof(contactId) !== 'undefined'

    // const noEmail = typeof(email) === 'undefined' ? true : typeof(email) === 'string' ? email.length <= 0 :  
    const noEmail = typeof(email) === 'undefined' ? true : email.length <= 0 ? true : !emailRegex.test(email)

    const checkName = (name) => typeof(name) !== 'undefined' ? name.length > 0 ? name : emptyName : emptyName  

    const hasDob = (() => {
        if (typeof(dob) === 'undefined') return false
        if (dob.length > 0) return true
        return false
    })()

    // console.log("No email?", noEmail)

    const variables = { 
        dob: hasDob ? dob : undefined ,
        id: typeof(contactId) !== 'undefined' ? `${contactId}` : undefined,
        email: noEmail ? undefined : email ,
        // externalId: typeof(externalId) !== 'undefined' ? `${externalId}` : undefined, 
        firstName: checkName(firstName),
        lastName: lastName, //checkName(lastName), 
        mobilePhone, 
        pronoun 
    }

    const mutation = gql`
        mutation ${hasContactId ? 'update_client' : 'create_client'}(${ hasDob ? '$dob: Date,' : ''} ${noEmail ? '' : '$email: String,'}${hasContactId ? '$id: String,' : ''} $firstName: String, $lastName: String, $mobilePhone: PhoneNumber, $pronoun: String) {
            ${hasContactId ? 'updateClient' : 'createClient'}(input: {
                ${hasDob ? 'dob: $dob,' : ''}
                ${hasContactId ? `id: $id,` : ''}
                ${noEmail ? '' : 'email: $email,'}
                firstName: $firstName,
                lastName: $lastName,
                mobilePhone: $mobilePhone,
                pronoun: $pronoun
            }) {
                client {
                    ${graphQlClientBody}
                }
            }
        }
    `

    const createOrUpdate = (value: boolean, pastTense: boolean = false) => value ? `create${pastTense ? 'd' : ''}` : `update${pastTense ? 'd' : ''}`

    type createClientResponse = {createClient:{client: Client}}
    type updateClientResponse = {updateClient:{client: Client}}
    type NewClientResponse = {
        client?: Client,
        waitForMs?: number,
    }

    const maxRetries = 3

    let newClient: Maybe<Client>
    var waitTime: number = 0
    var retries: number = 0
    do {
        if (waitTime > 0) {
            console.log(`BOULEVARD RATE LIMITED -- Waiting ${waitTime}ms before trying to create client`)
        }

        await Wait(waitTime)

        const _newClient: NewClientResponse = await (async (): Promise<NewClientResponse> => {
            try {
                const response = await gqlClient().request<createClientResponse | updateClientResponse>(mutation, variables)

                // console.log(`@@@@@@@@ RESPONSE`)
                // console.log(response)

                // return new Promise((resolve) => resolve(newClient))
                const { client: _newClient } = hasContactId ? (response as updateClientResponse).updateClient : (response as createClientResponse).createClient
                
                //@ts-ignore
                return new Promise(resolve => resolve({
                    client: _newClient
                }))
                
            } catch (error ) {
                console.error(`Could not ${createOrUpdate(hasContactId)} new Boulevard client`)
                // console.error(error)

                // console.log("ERROR MESSAGE FOR THE THING")
                // console.log("ERROR TYPE")
                // console.log(typeof(error))

                console.group("ERROR: ")
                console.log("KEYS")
                console.log(Object.keys(error as Object))

                Object.keys(error!).forEach((key) => {
                    console.log(error![key])
                })

                console.groupEnd()


                //@ts-ignore
                const { errors } = error.response 

                const message = errors[0].message

                const isMessageRateLimit = message.includes('API limit exceeded')

                if (!isMessageRateLimit) {
                    return new Promise((_, reject) => reject(error))
                }

                const waitTimeSection = message.match(getNumberWithMillisecondsUnit)

                if (typeof(waitTimeSection) === 'undefined' || Object.is(null, waitTimeSection)) {
                    return new Promise((_, reject) => reject(error))
                }

                const waitTimeInMs = `${waitTimeSection}`.split('').filter(character => character !== 'm' && character !== 's').join('')

                retries += 1

                return new Promise((resolve) => resolve({
                    waitForMs: parseInt(waitTimeInMs)
                }))
            }
        })()

        const { client, waitForMs } = _newClient

        if (typeof(client) !== 'undefined') {
            newClient = client
        }

        if (typeof(waitForMs) !== 'undefined') {
            waitTime = waitForMs
        }
    } while (
        typeof(newClient) === 'undefined' && 
        waitTime > 0 && 
        retries <= maxRetries
    )
    

    // console.log("NEW / UPDATED CLIENT")
    // console.log(newClient)

    if (typeof(newClient) === 'undefined') {
        throw new Error(`Could not ${createOrUpdate(hasContactId)} new Boulevard client`)
    }

    const { id: newClientId } = newClient
    

    if (typeof(newClientId) === 'undefined') {
        throw new Error(`Newly ${createOrUpdate(hasContactId, true)} Boulevard client has no id!`)
    }


   // Add Tags to Client if needed
    try {
        if (needsTagsCreated) await addTagsToClient(newClientId!, client.tags)
   } catch (error) {
        console.error(`Could not add tags to client id ${newClientId!}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
   }


   //Retrieve final contact object
   try {
        const finalClient: Maybe<Client> = await getClientInfoUsingId(newClientId)

        if (typeof(finalClient) == 'undefined') throw new Error(`Client ${newClientId} does not exist remotely for some reason`)
        
        return new Promise((resolve) => resolve(finalClient!))
   } catch (error) {
        console.error(`Error retrieving final contact object for ${createOrUpdate(hasContactId)} client function`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
   }

}


// export const updateClient = async (id: Id, client: Client): Promise<Maybe<Client>> => {

//     //? When the original client is pulled and needs changes applied,
//     //? the tags part needs to filter out all tags that have IDs, and pass that to addTagsToClient.
//     //? So when the spread operator is used to combine old tags with new, apply the filter to the old items.
//     //? By filtering out the tags with IDs, we are left with tag entries that need to be created and 
//     //? attached to the client.


// }

export const addTagsToClient = async (clientId: Id, tags: Tag[]): Promise<boolean> => {
    // type TagAdditionResultEntry = {
    //     id: Id,
    //     success: boolean,
    // }

    let tagIds: Id[]

    console.log("Adding tags to client:", clientId)

    // This try block creates the new tags
    try {
        //@ts-ignore
        tagIds = await tags.reduce(async (allResults: Promise<Id[]>, tag: Tag): Promise<Id[]> => {
            const existingResults: Id[] = await allResults
            //@ts-ignore
            const { name: tagName, id: tagId } = tag

            try {
                const tagTracker: TagTracker = await getTagTracker()

                const existingId: Maybe<Id> = tagTracker[tagName] || tagId

                console.log("EXISTING ID", existingId)

                let id: Id

                // If the tag does not exist in tagTracker, create a new one and add it
                if (typeof(existingId) === 'undefined') {
                    id = (await createNewTag(tag)).id!


                    await updateTagTracker({
                        ...tagTracker,
                        [tagName]: `${id}`
                    })
                } else {
                    // If this tag already exists, pull the existing Id
                    id = existingId
                }

                return new Promise(resolve => resolve(typeof(id) === 'undefined' ? existingResults : [
                    ...existingResults,
                    id
                ]))

            } catch (error) {
                console.error("Unable to process Boulevard tags")
                return new Promise(resolve => resolve(existingResults))
            }
        }, [])
    } catch (error) {
        console.error(`Could not create new tags for Boulevard`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
    
    // Now add tag IDs to the client
    try {

        type batchRequest = 
            {
                document: string,
                variables: {[key: string]: Id}
            }
        

        const mutation = gql`
            mutation add_tag($entityId: ID!, $tagId: ID!) {
                addTag(input: {
                    entityId: $entityId
                    tagId: $tagId
                }) {
                    tags {
                        id
                        name
                        symbol
                    }
                }
            }
        `

        const requests: batchRequest[] = tagIds.reduce((acc: batchRequest[], tagId): batchRequest[] => 
            [
                ...acc,
                {
                    document: mutation,
                    variables: {
                        entityId: clientId,
                        tagId
                    }
                }
            ], [])

        // console.log("TAG REQUESTS")
        // console.log(requests)

        //@ts-ignore
        const results: boolean[] = await requests.reduce(async (results: Promise<boolean[]>, currentRequest: batchRequest): Promise<boolean[]> => {
            const existingValues: boolean[] = await results
            const { document, variables } = currentRequest

            try {
                const result = await gqlClient().request(document, variables)

                // console.log("TAG RESULT")
                //@ts-ignore
                // console.log(result.addTag.tags)

                await incrementServiceIdLock(ThirdPartyService.Boulevard, CreateOrUpdate.Update, clientId as string)

                return new Promise((resolve) => resolve([
                    ...existingValues,
                    true
                ]))
            } catch (error) {
                console.error(`ERROR ADDING TAG ${variables.tagId} TO ENTITY ID ${variables.entityId}`)
                console.error(error)

                return new Promise((resolve) => resolve(existingValues))
            }
        }, [])

        // console.log("TAG ADD RESULTS")
        // console.log(results)

        return new Promise((resolve) => resolve(andReduction(results)))

    } catch (error) {
        console.error(`Could not add tags to client id ${clientId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }


}