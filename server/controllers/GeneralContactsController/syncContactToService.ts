import { createOrUpdateClient } from "../../ThirdPartyServices/Blvd/controllers/ClientController"
import { Client } from "../../ThirdPartyServices/Blvd/model/Client"
import { createOrUpdateContact } from "../../ThirdPartyServices/Podium/controllers/ContactController"
import { Contact } from "../../ThirdPartyServices/Podium/model/Contact"
import { thirdPartyServiceContactIdKey } from "../../constants/thirdPartyServiceContactIdKey"
import { convertGeneralContactToThirdPartyContact, getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithPrimaryKey, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "."
import { ValidContactType } from "./model/ValidContactType"
import { GeneralContact } from "../../model/GeneralContact"
import { Maybe } from "../../model/Maybe"
import { ThirdPartyService, ThirdPartyServiceMap } from "../../model/ThirdPartyService"
import { getContactIdentifier } from "../../ThirdPartyServices/Podium/controllers/ContactController/helpers/getContactIdentifier"
import { incrementServiceIdLock } from "../WebhookLocksController"

export const syncContactToService: ThirdPartyServiceMap<(arg0: GeneralContact, oldPodiumTags?: Maybe<string[]>, ghlId?: string) => Promise<ValidContactType>> = {
    [ThirdPartyService.Boulevard]: (_contact: GeneralContact) => _syncContactToService<Client>(_contact, ThirdPartyService.Boulevard),
    [ThirdPartyService.Podium]: (_contact: GeneralContact, oldPodiumTags: Maybe<string[]> = undefined, ghlId?: string) => _syncContactToService<Contact>(_contact, ThirdPartyService.Podium, oldPodiumTags, ghlId),
    [ThirdPartyService.GoHighLevel]: (_contact: GeneralContact) => { throw new Error("Not implemented") },
}

const _syncContactToService = async <T,>(_contact: GeneralContact, _service: ThirdPartyService, oldTags: Maybe<string[]> = undefined, ghlId?: string): Promise<T> => {
    // console.log("SYNC CONTACT DATA FOR", _service)
    // console.log("SYNC BELOW CONTACT:")
    // console.log(_contact)

    const { id, service_ids } = _contact //? Primary Key for database contact
    
    const serviceId: Maybe<string> = service_ids[_service]
    
    // console.log("SERVICE ID:")
    // console.log(serviceId)
    
    const shouldUpdate: boolean = (() => {
        if (typeof(serviceId) === 'undefined') return false
        if (serviceId.length <= 0) return false
        return true
    })()

    console.log("SHOULD UPDATE?", shouldUpdate ? "YES" : "NO")

    let newObject: T
    try {
        const _newObject = await convertGeneralContactToThirdPartyContact(_service, _contact) as T

        if (typeof(_newObject) === 'undefined') {
            throw new Error(`GeneralContact ID: ${id} produced an undefined contact/client when converted to ${_service}`)
        }

        newObject = _newObject

        // console.log("NEW Object")
        // console.log(newObject) //

        // TODO -- Now sync it to one of the services
        const syncFunction: ThirdPartyServiceMap<(arg0: T) => Promise<T>> = {
            [ThirdPartyService.Boulevard]: async (client: T): Promise<T> => {
                const result: Client = await createOrUpdateClient(client as Client, serviceId)    

                // console.log("RESULT!!!")
                // console.log(result)

                return new Promise<T>(resolve => resolve(result as T))
            },

            [ThirdPartyService.Podium]: async (contact: T) => {

                // const oldTags: Promise<Maybe<string[]>> = (async () => {
                //     if (shouldUpdate) {
                //         const oldPk = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, serviceId)

                //         if (typeof(oldPk) === 'undefined') {
                //             throw new Error(`Could not find the primary key for contact for contact ${serviceId}`)
                //         }

                //         const oldGeneralContact: Maybe<GeneralContact> = await getGeneralContactWithPrimaryKey(oldPk)

                //         if (typeof(oldGeneralContact) === 'undefined') {
                //             throw new Error(`Could not find the general contact with Podium identifier ${serviceId}}`)
                //         }
        
                //         return new Promise((resolve) => resolve(Object.keys(oldGeneralContact.tags).reduce((acc: string[], cv: string): string[] => [...acc, cv], [])))

                //     } 
                //     return new Promise((resolve) => resolve(undefined))
                // })()

                const result: Maybe<Contact> = await createOrUpdateContact(contact as Contact, shouldUpdate, shouldUpdate ? serviceId : undefined, oldTags, ghlId)

                if (typeof(result) === 'undefined') throw new Error('Could not find Podium Contact for update for some reason')

                return new Promise<T>(resolve => resolve(result! as T))
            },
            // TODO
            [ThirdPartyService.GoHighLevel]: async (contact: T) => { throw new Error("Not implemented") },
        }

        const syncedObject = await syncFunction[_service](newObject)

        // console.log("synced object")
        // console.log(syncedObject)
        // // console.log(syncedObject[thirdPartyServiceContactIdKey[_service]])

        const newIdKey = async (): Promise<string> => {
            const functions: ThirdPartyServiceMap<() => Promise<string>> = {
                [ThirdPartyService.Boulevard]: async () => new Promise((resolve) => resolve(syncedObject[thirdPartyServiceContactIdKey[ThirdPartyService.Boulevard]])),
                [ThirdPartyService.Podium]: async () => {
                    // const id = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, getContactIdentifier(syncedObject as Contact))
                    const id = getContactIdentifier(syncedObject as Contact)
                    
                    try {
                        if (typeof(id) === 'undefined') throw new Error('Could not find Podium Contact ID')

                        return new Promise((resolve) => resolve(id!))
                    } catch (error) {
                        console.error(error)

                        return new Promise((_, reject) => reject(error))

                    }

                },
                [ThirdPartyService.GoHighLevel]: async () => { throw new Error("Not implemented") },
            }
            
            return functions[_service]()
        } 

        // console.log("NEW ID KEY:", await newIdKey())

        return new Promise<T>(resolve => resolve(syncedObject as T))

    } catch (error) {
        console.error("Could not sync contact to third party service")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
