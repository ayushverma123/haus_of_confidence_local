import { getGeneralContactWithPrimaryKey } from "../../controllers/GeneralContactsController"
import { GeneralContact } from "../../model/GeneralContact"
import { Maybe } from "../../model/Maybe"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const REQUEST_getContactWithContactId = 'REQUEST_getContactWithContactId'
export const RESPONSE_getContactWithContactId = 'RECEIVE_getContactWithContactId'

export const getContactWithContactId: SocketFunctionEntry = {
    request: REQUEST_getContactWithContactId,
    response: RESPONSE_getContactWithContactId,

    socketFunction: async (contactId: string) => {
        try {
            const contact: Maybe<GeneralContact> = await getGeneralContactWithPrimaryKey(contactId)

            return new Promise((resolve) => resolve(contact))
        } catch (error) {
            console.error(`Socket function could not get contact with contactId: ${contactId}.`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }
}