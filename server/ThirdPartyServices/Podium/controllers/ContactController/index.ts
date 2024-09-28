import { serviceEndpoint } from "../../../../constants/endpoints"
import { needsTagsCreated as _needsTagsCreated } from "../../../../helpers/needsTagsCreated"
import { AxiosResponse } from "../../../../model/AxiosResponse"
import { EndpointType } from "../../../../model/EndpointType"
import { Maybe } from "../../../../model/Maybe"
import { ThirdPartyService } from "../../../../model/ThirdPartyService"
import { podiumHttpHeader } from "../../constants/podiumHttpHeader"
import { ApiResponse } from "../../model/ApiResponse"
import { Contact } from "../../model/Contact"
import { ContactTag } from "../../model/ContactTag"
import { CreateContactResponse } from "../../model/CreateContactResponse"
import { ContactObjectTag } from "../../model/ContactObjectTag"
import { createContactTag } from "../ContactTagsController"
import { getContactIdentifier } from "./helpers/getContactIdentifier"
import { Wait } from "../../../../helpers/Wait"
import { secondsToMilliseconds } from "../../../../helpers/UnitConversions"
import { getPodiumAccessTokenValue } from "../../stateManager"
import { addExistingTagToExistingContact } from "../ContactTagsController/addExistingTagToExistingContact"
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController"
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate"
import { getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithPrimaryKey, updateGeneralContactServiceIdsValue } from "../../../../controllers/GeneralContactsController"
import { getTagTracker } from "../../tagTracker/getTagTracker"
import { removeTagFromContact } from "../ContactTagsController/removeTagFromContact"
import { GeneralContact } from "../../../../model/GeneralContact"

const axios = require("axios")

const apiUrl = `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/contacts`

export type _newContactData = {
    email?: string,
    locations: string[],
    name: string,
    phoneNumber?: string,
    tags?: string[] // Takes the UIDs
}

export enum ContactIdentifiers {
    ConversationUid = "conversationUid",
    phoneNumber = "phoneNumber", 
    email = "email"
}

export const getAllContacts = async (): Promise<Contact[]> => {
    const endpoint = `${apiUrl}`

    var cursor: Maybe<string> = undefined
    var accumulatedContacts: Contact[] = []
    do {
        try {
            const { data, status, statusText }: AxiosResponse<ApiResponse<Contact[]>> = await axios.get(endpoint, { 
                ...await podiumHttpHeader(),
                params: {
                    limit: 100,
                    cursor
                }
            })
    
            const { metadata }: ApiResponse<Contact[]> = data
            const { nextCursor } = metadata
    
            if (status !== 200) {
                throw new Error(statusText)
            }

            accumulatedContacts = [
                ...accumulatedContacts,
                ...data.data
            ]

            cursor = nextCursor as string || undefined
             
        } catch (error) {
            console.error("Could not fetch contacts", error)

            cursor = undefined

            return new Promise((_, reject) => reject(error))
        }
    } while(cursor !== undefined)

    return new Promise((resolve) => resolve(accumulatedContacts))
}

export const getContactWithPhoneEmailOrConvoUid = async (identifier: string): Promise<Maybe<Contact>> => {
    const endpoint = `${apiUrl}/${encodeURIComponent(identifier)}`

    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<Contact>> = await axios.get(endpoint, { ...await podiumHttpHeader() })

        if (status === 404) {
            return new Promise((resolve) => resolve(undefined))
        }

        if (status !== 200) {
            throw new Error(statusText)
        }

        return new Promise((resolve) => resolve(data.data)) 
    } catch (error) {
        console.error("Could not fetch contact", error)

        return new Promise((resolve) => resolve(undefined))
    }
    
}

// TODO - test
//? contactID is the ID used to identify the contact on the service, not GeneralContact primary key
export const createOrUpdateContact = async (contact: Contact, shouldUpdate: boolean = false, serviceId: Maybe<string> = undefined, _oldTags: Maybe<string[]> = undefined, ghlId?: string): Promise<Maybe<Contact>> => {
    const endpoint = `${apiUrl}`
    // const shouldUpdate: boolean = typeof(contactId) !== 'undefined'
    const hasGhldata: boolean = typeof(ghlId) !== 'undefined' && ghlId.length > 0

    const shouldUpdateWithExisting = (shouldUpdate && typeof(serviceId) !== 'undefined') // || hasGhldata

    const incredulousErrorMessage = `meaning it has no name, phone number, or email, which should not be possible!`


    const { tags, phoneNumbers, emails, name } = contact

    //! Skip contact if it does not have a phone number and does not have an email
    // if (phoneNumbers.length <= 0 && emails.length <= 0 /* && typeof(contactId) === 'undefined' */) return new Promise((resolve) => resolve(contact))

    // Need to create all of these and reconstruct the required tags objects from the results
    const tagsWithNoId: ContactObjectTag[] = (tags || []).filter(({ uid }) => typeof(uid) === 'undefined')

    // console.log("CONTACT?S?A?DSA?DA?SD")
    // console.log(contact)

    // console.log("TAGS!!!!")
    // console.log(tags)

    //@ts-ignore
    const existingTagIds: string[] = (tags || [])
        .filter(({ uid }) => typeof(uid) !== 'undefined')
        .map(({ uid }) => uid)

    try {
        //@ts-ignore
        const createdTags: ContactTag[] = await tagsWithNoId.reduce(async (acc: Promise<ContactTag[]>, currentObjectTag: ContactObjectTag): Promise<ContactTag[]> => {
            const existing = await acc
            try {

                console.log("Creating Tag")

                const newTag: ContactTag = await createContactTag(currentObjectTag)

                console.log(newTag)

                return new Promise(resolve => resolve([
                    ...existing,
                    newTag
                ]))


            } catch (error) {
                console.error(`Error create Podium contact tag`)
                console.error(error)

                return new Promise((_, reject) => reject(error))
            }
        }, [])

        const tagsUIDArray: string[] = [
            ...existingTagIds,
            ...createdTags.map(({ uid }) => uid)
        ]
        
        const newContactData: _newContactData = {
            email: typeof(emails) !== 'undefined' ? emails.length > 0 ? emails[0] : undefined : undefined,
            locations: [ process.env.PODIUM_LOCATION_ID! ],
            name: typeof(name) !== 'undefined' ? name : '',
            phoneNumber: typeof(phoneNumbers) !== 'undefined' ? phoneNumbers.length > 0 ? `${phoneNumbers[0]}` : undefined : undefined,
        }

        // console.group('•••••••••••••••••••••••••••••••••••••••••••••••••')
        // console.log("NEW CONTACT DATA")
        // console.log(newContactData)


        const podiumRemoteIdForUpdate = shouldUpdateWithExisting ? `${serviceId}` : getContactIdentifier(contact) 

        // console.log('podiumRemoteIdForUpdate')
        // console.log(podiumRemoteIdForUpdate)        
        // console.groupEnd()

        const { data, status, statusText } = await (async () => {
                if (shouldUpdate) {

                    //? Update the contact first
                    const contactUpdatePromise: Promise<any> = axios.patch(`${endpoint}/${encodeURIComponent(podiumRemoteIdForUpdate)}`, newContactData, await podiumHttpHeader())

                    //? If there are tags, add them to the contact
                    if (tagsUIDArray.length > 0) {
                        // @ts-ignore
                        await tagsUIDArray.reduce(async (acc: Promise<boolean[]>, currentTagId: string): Promise<boolean[]> => {
                            const existing: boolean[] = await acc

                            try {
                                const returnValue: boolean = await addExistingTagToExistingContact(podiumRemoteIdForUpdate, currentTagId)

                                return new Promise((resolve) => resolve([...existing, returnValue]))
                            } catch (error) {
                                console.error(`Could not add tag ${currentTagId} to contact ${podiumRemoteIdForUpdate}`)
                                console.error(error)

                                return new Promise((_, reject) => reject(error))
                            }
                        }, [])
                    }

                    return contactUpdatePromise
                }
                
                return axios.post(endpoint, {
                    ...newContactData,
                    tags: tagsUIDArray.length > 0 ? tagsUIDArray : undefined
                }, await podiumHttpHeader()) 
        })()
        
        if (status !== 202) throw new Error(statusText)
        
        const { data: response } = data
        const { identifier: contactIdentifierFromServer } = response

        // const identifier = shouldUpdate ? podiumRemoteIdForUpdate : _identifier

        // await Wait(secondsToMilliseconds(0))

        // const identifier = getContactIdentifier(contact)

        // Now retrieve the full contact from the server and return it
        if (typeof(contactIdentifierFromServer) === 'undefined') {
            throw new Error(`Identifier for contact is undefined, ${incredulousErrorMessage}`)
        }

        if (typeof(contactIdentifierFromServer) !== 'string') {
            throw new Error(`Identifier for contact is not undefined, but is also not a string. Weird.`)
        }

        if (contactIdentifierFromServer === '' || contactIdentifierFromServer.length <= 0 ) {
            throw new Error(`Identifier for contact is an empty string, ${incredulousErrorMessage}`)
        }

        await incrementServiceIdLock(ThirdPartyService.Podium, !shouldUpdate ? CreateOrUpdate.Create : CreateOrUpdate.Update , contactIdentifierFromServer)

        // const finalContact: Maybe<Contact> = await getContactWithPhoneEmailOrConvoUid(identifier)

        const finalContact: Maybe<Contact> = {
            ...contact,
            uid: contactIdentifierFromServer
        }

        // console.group("§§§§§§§§§§§§§§§§§§§§§§§§§")
        //     console.log("FINAL CONTACT")
        //     console.log(finalContact)
        // console.groupEnd()

        //#region Tag Removal
        // So I need to pull the existing GeneralContact object to get the existing tags
        // Compare those existing tags to the new tags
        // Tags that are in old but not new need to be removed

        // Check for tags to remove if updating
        //! Removing PODIUM tags
        if (shouldUpdate || hasGhldata) {
            try {
                // const updateKey: Maybe<string> = shouldUpdateWithExisting 
                // // ? podiumRemoteIdForUpdate 
                // : await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, podiumRemoteIdForUpdate)
                // const generalContactPK: Maybe<string> = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, identifier)
                
                // if (typeof(generalContactPK) === 'undefined') {
                    //     throw new Error(`Could not find the primary key for contact ${identifier}`)
                    // }

                // const oldPk = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, identifier)

                // console.log("old pk")


                const { tags: newTags } = finalContact

                // console.log("REMOTE PODIUM ID:", podiumRemoteIdForUpdate)

                // const remotePodiumContact: Maybe<Contact> = await getContactWithPhoneEmailOrConvoUid(podiumRemoteIdForUpdate)

                const oldPk = await getGeneralContactPrimaryKeyWithServiceContactId(hasGhldata ? ThirdPartyService.GoHighLevel : ThirdPartyService.Podium, hasGhldata ? ghlId! : podiumRemoteIdForUpdate)

                if (typeof(oldPk) === 'undefined') {
                    throw new Error(`Could not find the primary key for contact for contact ${contactIdentifierFromServer}`)
                }

                await updateGeneralContactServiceIdsValue(oldPk, ThirdPartyService.Podium, contactIdentifierFromServer)



                // const oldGeneralContact: Maybe<GeneralContact> = await getGeneralContactWithPrimaryKey(oldPk)

                //await getGeneralContactWithPrimaryKey(generalContactPK)

                // if (typeof(remotePodiumContact) === 'undefined') {
                // if (typeof(oldGeneralContact) === 'undefined') {
                //     throw new Error(`Could not find the general contact with Podium identifier ${podiumRemoteIdForUpdate}}`)
                // }

                // const { tags: oldTags } = remotePodiumContact

                // const oldTags = Object.keys(oldGeneralContact.tags).reduce((acc: string[], cv: string): string[] => [...acc, cv], [])

                // if (typeof(oldTags) === 'undefined') {
                //     throw new Error(`Could not find the tags for the general contact with ID ${podiumRemoteIdForUpdate}`)
                // }

                // if () {

                    const oldTags = typeof(_oldTags) !== 'undefined' ? _oldTags : []

                    Wait(secondsToMilliseconds(1))

                    // console.group("OLD TAGS")
                    // console.log(oldTags)
                    // console.groupEnd()

                    // console.group("NEW TAGS")
                    // console.log(newTags)
                    

                    // The old tags will be key-value dictionary. Both key and value are the label -- Label can be used to get the UID of the tag to remove from the tagTracker for Podium
                    // New tags will be an array of ContactObjectTag
                    // If the number of keys in the key-value dictionary is equal to the number of entries in the ContactObjectTag array, then do not remove any tags
                    if (oldTags.length === newTags.length) {
                        console.debug("No tags to remove")
                    } else {

                        // Wait(secondsToMilliseconds(5))


                        // Look for the keys from oldTag in each newTag entry's label
                        // const tagLabelsToRemove: string[] = oldTags.reduce((acc: string[], currentTag: ContactObjectTag): string[] => {
                        //     const searchResult: Maybe<ContactObjectTag> = newTags.find(({ label }) => label === currentTag.label || label === currentTag.description)

                        //     const found: boolean = typeof(searchResult) !== 'undefined' && !Object.is(searchResult, null)

                        //     return found 
                        //         ? [ ...acc, searchResult!.label] 
                        //         : acc
                        // }, [])

                        // const tagLabelsToRemove: string[] = Object.keys(oldTags).reduce((acc: string[], currentTagKey: string): string[] => {
                        //     const searchResult: Maybe<ContactObjectTag> = newTags.find(({ label }) => label === currentTagKey)

                        //     const found: boolean = typeof(searchResult) !== 'undefined' && !Object.is(searchResult, null)

                        //     return found 
                        //         ? [ ...acc, searchResult!.label] 
                        //         : acc
                        // }, [])

                        const tagLabelsToRemove: string[] = oldTags.reduce((acc: string[], currentTagKey: string): string[] => {
                            const searchResult: Maybe<ContactObjectTag> = newTags.find(({ label }) => label === currentTagKey)

                            const found: boolean = typeof(searchResult) !== 'undefined' && !Object.is(searchResult, null)

                            return !found 
                                ? [ ...acc, currentTagKey] 
                                : acc
                        }, [])

                        console.debug("Tag Labels to Remove")
                        console.debug(tagLabelsToRemove)

                        // Retrieve the tag tracker object
                        const podiumTagTracker = await getTagTracker()

                        // Get UIDs from the tagTracker using the tagLabelsToRemove as the keys
                        const tagUidsToRemove: string[] = tagLabelsToRemove.reduce((acc: string[], currentLabel: string): string[] => {
                            const uid: Maybe<string> = podiumTagTracker[currentLabel]
                            const uidFound: boolean = typeof(uid) !== 'undefined' && !Object.is(uid, null)

                            return uidFound ? [
                                ...acc, 
                                uid
                            ] : acc
                        }, [])

                        console.debug("Tag UIDs to remove")
                        console.debug(tagUidsToRemove)

                        console.debug(`Removing ${Object.keys(tagUidsToRemove).length} from Podium`)

                        type tagRemovalResultEntry = {
                            success: boolean,
                            tagLabel: string,
                            tagUid: string,
                            error?: any
                        }

                        // Iterate through each UID and remove it from the remote contact and reduce each result into an array of results
                        //@ts-ignore
                        const tagRemovalResults: tagRemovalResultEntry[] = await tagUidsToRemove.reduce(async (acc: Promise<tagRemovalResultEntry[]>, tagUid: string, currentIndex: number): Promise<tagRemovalResultEntry[]> => {
                            const existing = await acc
                            const tagLabel = tagLabelsToRemove[currentIndex]

                            try {
                                await removeTagFromContact(podiumRemoteIdForUpdate, tagUid)

                                return new Promise((resolve) => resolve([
                                    ...existing,
                                    {
                                        success: true,
                                        tagLabel,
                                        tagUid
                                    }
                                ]))
                            } catch (error) {
                                // console.error(`Could not remove tag ${tagUid} from contact ${generalContactPK}`)

                                return new Promise((resolve) => resolve([
                                    ...existing,
                                    {
                                        success: false,
                                        tagLabel,
                                        tagUid,
                                        error
                                    }
                                ]))
                            }
                        }, [])

                        // Console.error the failures
                        tagRemovalResults.filter(({ success }) => !success).forEach(({ tagLabel, tagUid, error }) => {
                            console.error(`Could not remove tag ${tagLabel}:${tagUid} from contact ${podiumRemoteIdForUpdate}`)
                            console.error(error)
                        })

                    // }

                    
                }
            } catch (error) {
                console.error(`ERROR: Unable to process tags to remove for updated contact`)
                console.error(error)
            }
        }
        //#endregion

        return new Promise((resolve) => resolve(finalContact))
    } catch (error) {
        console.error(`∫∫∫∫∫∫∫∫ Could not create / update Podium contact`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}