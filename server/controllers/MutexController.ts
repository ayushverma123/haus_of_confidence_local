import { ThirdPartyService } from "../model/ThirdPartyService"

const db = require('../db')
const table = 'task_mutex'

export enum MutexTypes {
    WebhookCheck = "webhook_register",
    TokenRefresh = "token_refresh",
    ContactImport = "contact_import",
    BlvdTagPull = "blvd_tag_pull",
    BlvdApptPull = "blvd_appt_pull",
    AutomatedMessageProcessing = "automated_message_processing",
    MessageQueueRetry = "message_queue_retry",
    WebhooksQueueProcessing = "webhooks_queue_processing",
    BirthdateSync = "birthdate_sync",
}

const generateMutexId = (service: ThirdPartyService | string, mutexType: MutexTypes): string => `${service}_${mutexType}`

const queries = {
    getMutex: (service: ThirdPartyService | string, mutexType: MutexTypes): string => `SELECT * FROM ${table} WHERE id = '${generateMutexId(service, mutexType)}'`,
    createMutex: (service: ThirdPartyService | string, mutexType: MutexTypes, locked: boolean): string => `INSERT INTO ${table} (id, locked) VALUES ('${generateMutexId(service, mutexType)}', ${locked}) RETURNING locked`,
    updateMutex: (service: ThirdPartyService | string, mutexType: MutexTypes, locked: boolean): string => `UPDATE ${table} SET locked = ${locked} WHERE id = '${generateMutexId(service, mutexType)}' RETURNING locked`
}

export const createMutex = async (service: ThirdPartyService | string, mutexType: MutexTypes, locked: boolean = false): Promise<boolean> => {
    try {
        await db.query(queries.createMutex(service, mutexType, locked))

        return new Promise((resolve) => resolve(locked))
    } catch (error) {
        console.error(`Error creating mutex ${generateMutexId(service, mutexType)}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getMutex = async (service: ThirdPartyService | string, mutexType: MutexTypes): Promise<boolean> => {
    try {

        const { rows } = await db.query(queries.getMutex(service, mutexType))

        if (rows.length <= 0) {
            const newMutex = await createMutex(service, mutexType)
            return new Promise((resolve) => resolve(newMutex))
        }

        return new Promise((resolve) => resolve(rows[0].locked))

    } catch (error) {
        console.error(`Error getting mutex ${generateMutexId(service, mutexType)}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}

export const modifyMutex = async (service: ThirdPartyService | string, mutex: MutexTypes, value: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateMutex(service, mutex, value))

        return new Promise((resolve) => resolve(value))
    } catch (error) {
        return new Promise((_, reject) => reject(error))
    }
}

