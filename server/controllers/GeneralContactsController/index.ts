import { Client } from "../../ThirdPartyServices/Blvd/model/Client"
import { Tag as BlvdTag } from "../../ThirdPartyServices/Blvd/model/Tag"
import { convertNameToFirstAndLast } from "../../helpers/convertNameFieldToFirstAndLast"
import { getUSAddressStringFromLocationUid as getUsAddressFromPodiumLocationUid } from "../../ThirdPartyServices/Podium/controllers/LocationController"
import { Contact } from "../../ThirdPartyServices/Podium/model/Contact"
import { ContactObjectTag as PodiumTag, ContactObjectTag } from "../../ThirdPartyServices/Podium/model/ContactObjectTag" 
import { andReduction } from "../../helpers/ArrayFunctions"
import { GeneralContact, GeneralContactField } from "../../model/GeneralContact"
import { GeneralContactTags } from "../../model/GeneralContactTags"
import { Maybe } from "../../model/Maybe"
import { ThirdPartyService, thirdPartyServiceFromLowercaseServiceName, ThirdPartyServiceMap } from "../../model/ThirdPartyService"
import { ValidContactType } from "./model/ValidContactType"
import { Location as BlvdLocation } from "../../ThirdPartyServices/Blvd/model/Location"
import { isPopulatedString } from "../../helpers/StringHelper"
import { ContactAttribute } from "../../ThirdPartyServices/Podium/model/ContactAttribute"
import { ContactEqualityType } from "./model/ContactEqualityType"
import { ContactTag } from "../../ThirdPartyServices/Podium/model/ContactTag"
import { getContactIdentifier } from "../../ThirdPartyServices/Podium/controllers/ContactController/helpers/getContactIdentifier"
import emptyName from "../../constants/emptyName"
import { justTitleAndId } from "../../ThirdPartyServices/Podium/controllers/ContactTagsController/justTitleAndId"
import { thirdPartyServiceContactIdKey } from "../../constants/thirdPartyServiceContactIdKey"
import { getTagTracker } from "../../ThirdPartyServices/Podium/tagTracker/getTagTracker"
import { TagTracker } from "../StateManager/model/TagTracker"
import { getContactObjectTagArrayFromTagTracker } from "../../ThirdPartyServices/Podium/tagTracker/getContactObjectTagArrayFromTagTracker"
import { doesTagTrackerHaveTag } from "../../ThirdPartyServices/Podium/tagTracker/doesTagTrackerHaveTag"
import { getAllTags } from '../../ThirdPartyServices/Podium/controllers/ContactTagsController'
import { refreshTagTracker } from "../../ThirdPartyServices/Podium/tagTracker/refreshTagTracker"
import { secondsToMilliseconds } from "../../helpers/UnitConversions"
import { Wait } from "../../helpers/Wait"
import { doesTagTrackerHaveTagId } from "../../ThirdPartyServices/Podium/tagTracker/doesTagTrackerHaveTagId"
import { getTagLabelFromTagId } from "../../ThirdPartyServices/Podium/tagTracker/getTagLabelFromTagId"
import tableName from "./constants/tableName"
import { Contact as GHLContact } from "../../ThirdPartyServices/GoHighLevel/model/Contact"
import { standardEscapedString } from "./conversionTemplates/standardEscapedString"
import { standardKeyValueToValueArray } from "./conversionTemplates/standardKeyValueToValueArray"
import { standardArrayToSingleValue } from "./conversionTemplates/standardArrayToSingleValue"
import { standardKeyValueDictionaryToPodiumTags } from "./conversionTemplates/standardKeyValueDictionaryToPodiumTags"
import { standardGeneralContactTagsToBoulevardTags } from "./conversionTemplates/standardGeneralContactTagsToBoulevardTags"
import convertDateToBoulevardDateOfBirthValue from "./helpers/convertDateToBoulevardDateOfBirthValue"
import { removeExcludedTimeUnits } from "../AutomatedMessagesController/configurationProcessor/helpers/removeExcludedTimeUnits"
import { TimeUnit } from "../AutomatedMessagesController/model/AutomatedMessageTimeConfigEntry"
import getContactBirthdate from "../../ThirdPartyServices/Podium/helpers/getContactBirthdate"
import { getBirthdateAttributeId } from "../../ThirdPartyServices/Podium/controllers/ContactAttributesController/StateManager"
import { getContactWithPhoneEmailOrConvoUid } from "../../ThirdPartyServices/Podium/controllers/ContactController"
import { getGeneralContactDateOfBirth } from "./getGeneralContactDateOfBirth"

const db = require('../../db')

// const escapeSpecialCharacters = (value) => value

// The goal is to make implementing another ThirdPartyService's contact synchronization basically autonatic

// Will need a mapping for each service to and from the GeneralContact type and the service's type
// Will need a mapping for each service to a function that takes the mapping above and converts the input object

export const generateSyncedWithServiceObject = (servicesToTrue: ThirdPartyService[]): ThirdPartyServiceMap<boolean> => 
//@ts-ignore
    Object.values(ThirdPartyService).reduce((allServices, currentService) => ({
        ...allServices,
        [currentService]: servicesToTrue.includes(currentService)
    }), {})

    
// const serviceIdKeys: ThirdPartyServiceMap<string> ={
//     [ThirdPartyService.Boulevard]: 'id',
//     [ThirdPartyService.Podium]: 'uid',
//     [ThirdPartyService.GHL]: 'id',
// }

const serviceIdKeys: ThirdPartyServiceMap<string> = thirdPartyServiceContactIdKey

const queries = {
    insertGeneralContact: (service: ThirdPartyService, contact: GeneralContact) => ({
        text: `
            INSERT INTO ${tableName}(
                first_name, 
                last_name, 
                tags, 
                emails, 
                address, 
                phone_numbers, 
                original_service, 
                original_contact_object, 
                synced_with_service,
                created_at,
                updated_at,
                service_ids,
                birthdate
            ) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *;`,
        values: [
            contact.first_name || "",
            contact.last_name || "",
           JSON.stringify(contact.tags || []),
            contact.emails || [],
            contact.address || [],
            contact.phone_numbers || [],
            contact.original_service.toLowerCase(),
            JSON.stringify(contact.original_contact_object),
            JSON.stringify(generateSyncedWithServiceObject([service, ThirdPartyService.GoHighLevel])),
            contact.created_at,
            contact.updated_at,
            contact.service_ids,
            contact.birthdate
        ]
    }),
    updateGeneralContact: (contactId: string, contact: GeneralContact) => ({
        text: `
        UPDATE ${tableName} SET 
            first_name = $1, 
            last_name = $2, 
            tags = $3, 
            emails = $4, 
            address = $5,
            phone_numbers = $6,
            original_service = $7,
            original_contact_object = $8,
            updated_at = $10,
            service_ids = $11
            ${ typeof(contact.birthdate) !== 'undefined' ? ',birthdate = $12' : ''}
        WHERE id = $9
        RETURNING *;`,
        values: [
            contact.first_name || "",
            contact.last_name || "",
            JSON.stringify(contact.tags || []),
            contact.emails || [],
            contact.address || [],
            contact.phone_numbers || [],
            contact.original_service.toLowerCase(),
            JSON.stringify(contact.original_contact_object),
            parseInt(contactId),
            new Date().toISOString(),
            contact.service_ids,
            ...(typeof(contact.birthdate) !== 'undefined'? [contact.birthdate] : [])
        ]
    }),
    updateGeneralContactServiceIds: (contactId: string, serviceIds: ThirdPartyServiceMap<string>) => ({
        text: `
            UPDATE ${tableName} SET 
                service_ids = $1,
                updated_at = $3
            WHERE id = $2
            RETURNING *;
        `,
        values: [
            serviceIds,
            contactId,
            new Date().toISOString(),
        ]
    }),

    updateGeneralContactSyncedWithServices: (contactId: string, syncedWithServices: ThirdPartyServiceMap<boolean>) => ({
        text: `
            UPDATE ${tableName} SET 
                synced_with_service = $1,
                updated_at = $3
            WHERE id = $2
        `,
        values: [
            JSON.stringify({
                ...syncedWithServices,
                // [ThirdPartyService.GoHighLevel]: true, //! GoHighLevel should always be true -- it is not part of the contact syncing stuff -- nvm, 
            }),
            contactId,
            new Date().toISOString()
        ]
    }),

    updateGeneralContactBirthdate: (contactId: string, dateOfBirth: Date) => ({
        text: `
            UPDATE ${tableName} SET 
                birthdate = $1,
                updated_at = $3
            WHERE id = $2
        `,
        values: [
            dateOfBirth.toISOString(),
            contactId,
            new Date().toISOString()
        ]
    }),

    getAllGeneralContacts: `SELECT * FROM ${tableName} WHERE deleted = false;`,
    getAllGeneralContactsWithoutBirthdates: `SELECT * FROM ${tableName} WHERE deleted = false AND birthdate IS NULL;`,
    getAllGeneralContactsWithBirthdates: `SELECT * FROM ${tableName} WHERE deleted = false AND birthdate IS NOT NULL;`,
    getAllContactsForService: (service: ThirdPartyService) => ({
        text: `SELECT * FROM ${tableName} WHERE original_service = '${service.toLowerCase()}' AND deleted = false;`,
    }),
    getGeneralContactFromPrimaryKey: (primaryKey: string, allowedDeleted: boolean = false) => ({
        text: `
        SELECT * FROM ${tableName} 
            WHERE id = $1
            AND deleted = $2;`,
        values: [
            primaryKey,
            allowedDeleted
        ]
    }),
    getGeneralContactFromOriginalContactObjectID: (service: ThirdPartyService, contactId: string) => ({
        text: `
        SELECT * FROM ${tableName} 
        WHERE original_service = $1 
            AND deleted = false 
            AND original_contact_object @> '{"${serviceIdKeys[service]}":"${contactId}"}'`,
        values: [
            service.toLowerCase()
        ]
    }),
    getGeneralContactFromOriginalServiceID: (service: ThirdPartyService, contactId: string) => ({
        text: `
        SELECT * FROM ${tableName} 
            WHERE deleted = false
            AND service_ids @> '{"${[service]}":"${contactId}"}'`,
    }),
    updateGeneralContactDeletedValue: (contactId: string, deleted: boolean) => ({
        text: `UPDATE ${tableName} SET deleted = $1, deleted_at = $2, updated_at = $4 WHERE id = $3;`,
        values: [
            deleted,
            (new Date()).toISOString(),
            parseInt(contactId),
            new Date().toISOString()
        ]
    })
}

// TODO - Boulevard
export const convertThirdPartyContactToGeneralContact = async (service: ThirdPartyService, contactObject: ValidContactType, syncedWithService: ThirdPartyServiceMap<boolean>): Promise<GeneralContact> => {
    // Will need a mapping that maps each Contact field to a GeneralContact field
    // this mapping needs to be {[key in ContactField]: () => string}
    // will need another mapping {[key in ContactField]: type needed for that field on other remote server} --> that's effectively a type definition lol
    // So each contact gets converted to a general contact and added to the contacts table in the database
    // This step just needs to convert the contact to a general contact that will fit the database table.
    //! Database table should have a service_contact jsonb field that will contain the raw contact data from the originating third party service
    //! And another field original_service enum that will contain the original third party service that the contact came from
    //! This way, the original object will always be there for whatever reason


    //! Forget all that bullshit above
    //! Just create mappings that take the current contact object's field and return the ID for the corresponding GeneralContact field
    //! Then take another mapping that takes the current contact object's field and the value of it and returns that value in the type needed for GeneralContact
    //! And finally, an array of relevant fields for each service's contact object. All other fields will be ignored, and the data will be stored as the original object
    //! Use a reduction to construct this

    //! The mappings above can be typed using enums, and Object.values() for the enum stuff as long as the enum and the value are the same

    //? The fields to check
    const relevantFields: ThirdPartyServiceMap<string[]> = {
        [ThirdPartyService.Boulevard]: [
            "createdAt",
            "email",
            "firstName",
            "lastName",
            "mobilePhone",
            // "name",
            "tags",
            "updatedAt",
            "primaryLocation",
            "dob",
        ],
        [ThirdPartyService.Podium]: [
            "name",
            "emails",
            "locations",
            "phoneNumbers",
            "tags",
            "createdAt",
            "updatedAt",
            "attributes"
        ],
        [ThirdPartyService.GoHighLevel]: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "tags",
            "dateAdded",
            "dateUpdated",
        ]
    }

    //? { Original Object Contact Field Name : General Contact Field Name}
    const fieldMapping: ThirdPartyServiceMap<{[key: string]: GeneralContactField }> = {
        [ThirdPartyService.Boulevard]: {
            createdAt: GeneralContactField.created_at,
            email: GeneralContactField.emails,
            firstName: GeneralContactField.first_name,
            lastName: GeneralContactField.last_name,
            mobilePhone: GeneralContactField.phone_numbers,
            tags: GeneralContactField.tags,
            updatedAt: GeneralContactField.updated_at,
            primaryLocation: GeneralContactField.address,
            dob: GeneralContactField.birthdate,
        },
        [ThirdPartyService.Podium]: {
            name: GeneralContactField.first_name,
            emails: GeneralContactField.emails,
            locations: GeneralContactField.address, // Need to do some extra work here to make this an actual array of addresses
            phoneNumbers: GeneralContactField.phone_numbers,
            tags: GeneralContactField.tags,
            createdAt: GeneralContactField.created_at,
            updatedAt: GeneralContactField.updated_at,
        },
        [ThirdPartyService.GoHighLevel]: {
            firstName: GeneralContactField.first_name,
            lastName: GeneralContactField.last_name,
            email: GeneralContactField.emails,
            phone: GeneralContactField.phone_numbers,
            tags: GeneralContactField.tags,
            dateAdded: GeneralContactField.created_at,
            dateUpdated: GeneralContactField.updated_at
        }
    }

    //? Use this mapping to convert the value of the contact object's field to the type needed for the GeneralContact
    const valueConversionMapping: ThirdPartyServiceMap<{[key: string]: (arg0) => any}> = {
        [ThirdPartyService.Boulevard]: {
            createdAt: (value) => value,
            email: (value) => typeof(value) === 'undefined' ? [] : value.length > 0 ? [value] : [],
            firstName: (value) => typeof(value) !== 'undefined' ? value : value,
            lastName: (value) => typeof(value) !== 'undefined' ? value : value,
            mobilePhone: (value) => typeof(value) !== 'undefined' && !Object.is(value, null) ? [value] : [],
            updatedAt: (value) => value,
            dob: (value) => new Date(value).toISOString()
        },
        [ThirdPartyService.Podium]: { 
            emails: (value) => value,
            phoneNumbers: (value) => value, 
            tags: (value) => value,
            createdAt: (value) => value,
            updatedAt: (value) => value
        },
        [ThirdPartyService.GoHighLevel]: {
            email: (value) => typeof(value) === 'undefined' ? [] : value.length > 0 ? [value] : [],
            phone: (value) => typeof(value) !== 'undefined' && !Object.is(value, null) ? [value] : [],
            tags: (value) => value
        }
    }

    // will take Service and current field name and return a function that will return the correct modification of the thing
    //? key in the mapping is the field name for the contact being converted
    const alternativeValueFunctionMapping: ThirdPartyServiceMap<{[originalContactFieldName: string]: (arg0, arg1) => Promise<{[key: string]: any}>}> = {
        [ThirdPartyService.Boulevard]: {
            tags: async (allFields: any, tags: BlvdTag[]) => {
                const existingFields = await allFields 
                
                return new Promise(resolve => resolve(
                    {
                        ...existingFields,
                        [GeneralContactField.tags]: tags.reduce((allTags: GeneralContactTags, currentTag: BlvdTag): GeneralContactTags => {
                            return {
                                ...allTags,
                                [currentTag.name]: currentTag.name
                            }
                        }, {})
                    }
                ))
            },
            primaryLocation: async (allFields: any, primaryLocation: BlvdLocation) => {
                const existingFields = await allFields
                const { address } = primaryLocation
                const { line1, line2, city, state, zip } = address

                const hasLine1 = typeof(line1) === "string"
                const hasLine2 = typeof(line2) === "string"
                const hasCity = typeof(city) === "string"
                const hasState = typeof(state) === "string"
                const hasZip = typeof(zip) === "string"

                const formattedAddress = `${hasLine1 ? `${line1}\n` : ''}${hasLine2 ? `${line2}\n` : ''}${hasCity ? `${city}${hasState ? ', ' : ''}` : '' }${hasState ? `${state} ` : ''}${hasZip ? `${zip}` : ''}`

                return new Promise((resolve) => resolve(
                    {
                        ...existingFields,
                        [GeneralContactField.address]: formattedAddress.length <= 0 ? [] : [formattedAddress]
                    }
                ))
            }
        },
        [ThirdPartyService.Podium]: {
            name: async (allFields: any, currentValue: any) => {
                const splitName = convertNameToFirstAndLast(currentValue)

                const returnValue = {
                    ...allFields,
                    [GeneralContactField.first_name]: typeof(splitName[0]) !== 'undefined' ? splitName[0] : splitName[0],
                    [GeneralContactField.last_name]: typeof(splitName[1]) !== 'undefined' ? splitName[1] : splitName[1],
                }

                return new Promise((resolve) => resolve(returnValue))
            },
            locations: async (allFields, locationUids: string[]) => {

                const existingFields = await allFields

                //! Keep this so it ignores the rest
                //! It looks like locations returns the location of the business these customers are using
                return new Promise((resolve) => resolve({
                    ...existingFields,
                    [GeneralContactField.address]: []
                }))

                //@ts-ignore
                const newAddresses = await locationUids.reduce((async (allAddresses: string[], { uid }: string): Promise<string[]> => {
                    const existingAddresses = await allAddresses
                    
                    try {
                        
                        const addressString = await getUsAddressFromPodiumLocationUid(uid)

                        return new Promise((resolve) => resolve([...existingAddresses, addressString]))

                    } catch (error) {
                        console.error("Could not convert podium location UID to address")
                        console.error(error)

                        return new Promise((resolve) => resolve(existingAddresses))
                    }
                }), [])

                return new Promise((resolve) => resolve({
                    ...existingFields,
                    "address": newAddresses
                }))
            },
            tags: async (allFields, tags: string[]) => {
                const existingFields = await allFields

                //@ts-ignore
                const tagsReturnValue: GeneralContactTags = await tags.map(({ uid }) => uid).reduce(async (allTags: Promise<GeneralContactTags>, currentTag: string): Promise<GeneralContactTags> => {
                    const existing = await allTags
                    // Need to look at tag tracker and get the value for this tag's uid
                    try {
                        // const tagExists: boolean = await doesTagTrackerHaveTag(currentTag)
                        const tagExists: boolean = await doesTagTrackerHaveTagId(currentTag)
                    
                        
                        // const tagTracker: TagTracker = await (async () => {
                        if (!tagExists) {
                            console.log(`PODIUM TAG ${currentTag} DOES NOT EXIST`)
                            
                            await refreshTagTracker()

                            await Wait(secondsToMilliseconds(1))
                        }

                        const tagLabel = await getTagLabelFromTagId(currentTag)

                        if (typeof(tagLabel) === 'undefined' || Object.is(tagLabel, null)) {
                            throw new Error(`Could not find tag ${currentTag} in tag tracker`)
                        }

                        return new Promise((resolve) => resolve(
                            {
                                ...existing,
                                [tagLabel]: tagLabel
                            }
                        )) 
                    } catch (error) {
                        console.error(`Could not get tag value from tag tracker for ${currentTag}`)
                        console.error(error)

                        return new Promise((_, reject) => reject(error))
                    }
                }, {})

                return new Promise((resolve) => resolve({
                    ...existingFields,
                    [GeneralContactField.tags]: tagsReturnValue
                }))
            },
            attributes: async (allFields, attributes: ContactAttribute[]) => {
                const existingFields = await allFields
                const contactId = getContactIdentifier(contactObject as Contact)
                const generalContactId: Maybe<string> = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, contactId)

                console.log("PROCESSING ATTRIBUTES")
                
                try {
                    if (typeof(generalContactId) === 'undefined' || Object.is(generalContactId, null) || (generalContactId ?? '').length <= 0) {
                        throw new Error(`Could not find general contact id for contact ${contactId}`)
                    }

                    setTimeout(async () => {

                        const contact: Maybe<Contact> = await getContactWithPhoneEmailOrConvoUid(contactId)
                        
                        if (typeof(contact) === 'undefined' || Object.is(contact, null)) {
                            throw new Error(`Could not find contact ${contactId} on Podium servers`)
                        }
                        
                        const birthdateAttributeId = await getBirthdateAttributeId()
                        
                        console.log("BIRTHDATE ATTRIBUTE ID", birthdateAttributeId)
                        
                        const contactBirthdate: Maybe<Date> = getContactBirthdate(contact, birthdateAttributeId)
                        
                        console.log("CONTACT BIRTHDATE", contactBirthdate)

                        const emptyTest: string = (`${contactBirthdate}` ?? '')

                        if (typeof(contactBirthdate) !== 'undefined' || !Object.is(contactBirthdate, null) || emptyTest === 'undefined' || emptyTest.length <= 0 )  {
                            console.log(`CONTACT BIRTHDATE ${contactBirthdate} IS NOT NULL`)

                            await updateGeneralContactBirthdateValue(generalContactId, contactBirthdate!)
                            

                            console.log(`BIRTHDATE UPDATED FOR CONTACT ${contactId}`)
                        }
                        
                    }, secondsToMilliseconds(60))

                    // if (typeof(contactBirthdate) === 'undefined' || Object.is(contactBirthdate, null)) {
                    //         return new Promise((resolve) => resolve(existingFields))
                    // }

                    
                    // return new Promise((resolve) => resolve({
                    //     ...existingFields,
                    //     [GeneralContactField.birthdate]: contactBirthdate
                    // }))
                    
                    return new Promise((resolve) => resolve(existingFields))

                } catch (error) {
                    console.error(`Could not get contact birthdate`)
                    console.error(error)
                    
                    // return new Promise((_, reject) => reject(error))
                    return new Promise((resolve) => resolve(existingFields))
                }
            }
        },
        //@ts-expect-error
        [ThirdPartyService.GoHighLevel]: async () => {
            // tags: async (allFields: any, tags: string[]) => {
            //     const existingFields = await allFields
            // }
        }
    }
    //@ts-ignore
    const serviceIds: ThirdPartyServiceMap<string> = Object.values(ThirdPartyService).filter(key => key === service).reduce((acc: ThirdPartyServiceMap<string>, key: string): ThirdPartyServiceMap<string> => {
        const getContactObjectIdValue: ThirdPartyServiceMap<() => string> = {
            [ThirdPartyService.Boulevard]: (): string => {
                const client = contactObject as Client

                return `${client.id}`
            },
            [ThirdPartyService.Podium]: (): string => {
                const contact = contactObject as Contact

                let id: string 

                try {
                    id = getContactIdentifier(contact)

                    if (typeof(id) === 'undefined') throw new Error(`Could not determine contact identifier for contact ${contact}`)

                    return id
                } catch (error) {
                    throw error
                }
            },
            [ThirdPartyService.GoHighLevel]: (): string => {
                const contact = contactObject as GHLContact

                return contact.id
            }
        }

        const currentService = ThirdPartyService[key]
        const newValue: Maybe<string> = getContactObjectIdValue[currentService]()

        return typeof(newValue) === 'undefined' || newValue === 'undefined' ? acc :{
            ...acc,
            [ThirdPartyService[key]]: newValue
        }
    }, {})

    //@ts-ignore
    const newGeneralContact: GeneralContact = ({
        original_service: service,
        original_contact_object: contactObject,
        service_ids: serviceIds,
        synced_with_service: {
            ...syncedWithService,
            [ThirdPartyService.GoHighLevel]: true
        },
        ...await (relevantFields[service].reduce(async (allFields, currentField: string) => {
            const currentValue = contactObject[currentField]
            const generalContactFieldId = fieldMapping[service][currentField]
            const existingFields = await allFields

            if (typeof(currentValue) === 'undefined') {
                return new Promise((resolve) => resolve(existingFields))
            }

            //! Special exceptions to typical execution
            const specialExceptionFunction = alternativeValueFunctionMapping[service][currentField]
            if (typeof(specialExceptionFunction) !== "undefined") {
                return await specialExceptionFunction(allFields, currentValue)
            }

            // console.log("CURRENT SERVICE: ", service)
            // console.log("CURRENT FIELD: ", currentField)

            const newValue = valueConversionMapping[service][currentField](currentValue)
        
            const returnValue = {
                ...existingFields,
                [generalContactFieldId]: newValue
            }

            return new Promise((resolve) => resolve(returnValue))
        }, {})),
    })

    return new Promise((resolve) => resolve(newGeneralContact))
}

//@ts-ignore
export const convertGeneralContactToThirdPartyContact = async <T,>(targetService: ThirdPartyService, generalContact: GeneralContact): Promise<ValidContactType | T> => {
    const allGeneralFields = Object.values(GeneralContactField)
    const originalService = thirdPartyServiceFromLowercaseServiceName[generalContact.original_service.toLowerCase()]

    //? Maps general contact field keys to ThirdPartyService keys
    const fieldMapping: ThirdPartyServiceMap<{[key in GeneralContactField]: Maybe<string>}> = {
        [ThirdPartyService.Boulevard]: {
            [GeneralContactField.id]: undefined,
            [GeneralContactField.first_name]: "firstName",
            [GeneralContactField.last_name]: "lastName",
            [GeneralContactField.tags]: "tags",
            [GeneralContactField.emails]: "email",
            [GeneralContactField.address]: "primaryLocation",
            [GeneralContactField.phone_numbers]: "mobilePhone",
            [GeneralContactField.original_service]: undefined,
            [GeneralContactField.original_contact_object]: undefined,
            [GeneralContactField.syncedWithService]: undefined,
            [GeneralContactField.created_at]: "createdAt",
            [GeneralContactField.updated_at]: "updatedAt",
            [GeneralContactField.service_ids]: undefined,
            [GeneralContactField.birthdate]: "dob"
        },
        [ThirdPartyService.Podium]: {
            [GeneralContactField.id]: undefined,
            [GeneralContactField.first_name]: "name", 
            [GeneralContactField.last_name]: undefined, 
            [GeneralContactField.tags]: "tags",
            [GeneralContactField.emails]: "emails",
            [GeneralContactField.address]: undefined,
            [GeneralContactField.phone_numbers]: "phoneNumbers",
            [GeneralContactField.original_service]: undefined,
            [GeneralContactField.original_contact_object]:undefined,
            [GeneralContactField.syncedWithService]: undefined,
            [GeneralContactField.created_at]: "createdAt",
            [GeneralContactField.updated_at]: "updatedAt",
            [GeneralContactField.service_ids]: undefined,
            [GeneralContactField.birthdate]: undefined // Podium does not have a dedicated birthdate field
        },
        [ThirdPartyService.GoHighLevel]: {
            [GeneralContactField.id]: undefined,
            [GeneralContactField.first_name]: "firstName",
            [GeneralContactField.last_name]: "lastName",
            [GeneralContactField.tags]: "tags",
            [GeneralContactField.emails]: "email",
            [GeneralContactField.address]: undefined,
            [GeneralContactField.phone_numbers]: "phone",
            [GeneralContactField.original_service]: undefined,
            [GeneralContactField.original_contact_object]: undefined,
            [GeneralContactField.syncedWithService]: undefined,
            [GeneralContactField.created_at]: "dateAdded",
            [GeneralContactField.updated_at]: "dateUpdated",
            [GeneralContactField.service_ids]: undefined,
            [GeneralContactField.birthdate]: undefined, // TODO -- Add birthdate to GoHighLevel later, if needed
        }
    }


    const removeEmptyBoulevardName = (value) => {
        console.log(value === "N/A")
        return value === emptyName ? undefined : value

    }

    // Undefined conversion mappings mean ignore that field if the fieldMapping and the customFieldFunction are also undefined
    // Convert from source to target
    //? The values presented here from the processor are pulled from the specified GeneralContact field.
    //? The customFieldFunction allows for custom processing of the values and should be used for original_contact_object stuff
    const valueConversionMapping: ThirdPartyServiceMap<ThirdPartyServiceMap<{[key in GeneralContactField]: Maybe<(value) => any>}>> = {
        [ThirdPartyService.Boulevard]: {
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined, // removeEmptyBoulevardName, // (value) => value, 
                [GeneralContactField.last_name]: undefined, //removeEmptyBoulevardName, 
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]:undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: (value) => convertDateToBoulevardDateOfBirthValue(value) // TODO -- Doublecheck the values coming from the original_contact_object
            },
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined, // Handle these two in original_contact_object 
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: (emails) => emails,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => phoneNumbers,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]:undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined // There is no birthdate field in Podium
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: standardEscapedString,
                [GeneralContactField.last_name]: standardEscapedString,
                [GeneralContactField.tags]: standardKeyValueToValueArray,
                [GeneralContactField.emails]: (emails) => standardArrayToSingleValue(emails) ?? undefined, // ?? "",
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => standardArrayToSingleValue(phoneNumbers) ?? undefined, // ?? "",
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined // TODO -- Implement later, if needed
            }
        },
        [ThirdPartyService.Podium]: {
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: standardEscapedString, 
                [GeneralContactField.last_name]: standardEscapedString, 
                [GeneralContactField.tags]: undefined, 
                [GeneralContactField.emails]: (emails) => standardArrayToSingleValue(emails) ?? "",
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => standardArrayToSingleValue(phoneNumbers) ?? "",
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: (value) => convertDateToBoulevardDateOfBirthValue(value)
            },
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: (value) => value, 
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: undefined, 
                [GeneralContactField.emails]: (value) => value,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (values) => values,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]:undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: standardEscapedString,
                [GeneralContactField.last_name]: standardEscapedString,
                [GeneralContactField.tags]: standardKeyValueToValueArray,
                [GeneralContactField.emails]: (emails) => standardArrayToSingleValue(emails) ?? undefined, // ?? "",
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => standardArrayToSingleValue(phoneNumbers) ?? undefined, // ?? "",
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined // TODO -- Implement later, if needed
            }
        },
        // TODO - Doesn't need to be converted to anything but podium
        [ThirdPartyService.GoHighLevel]: {
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: standardEscapedString,
                [GeneralContactField.last_name]: standardEscapedString,
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: (value) => convertDateToBoulevardDateOfBirthValue(value)
            }, 
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined, // Handle these two in original_contact_object 
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: (emails) => emails,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => phoneNumbers,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]:undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined // There is no birthdate field in Podium
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: standardEscapedString,
                [GeneralContactField.last_name]: standardEscapedString,
                [GeneralContactField.tags]: standardKeyValueToValueArray,
                [GeneralContactField.emails]: (emails) => standardArrayToSingleValue(emails) ?? undefined, // ?? "",
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: (phoneNumbers) => standardArrayToSingleValue(phoneNumbers) ?? undefined, // ?? "",
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: (value) => value,
                [GeneralContactField.updated_at]: (value) => new Date(value).toISOString(),
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined // TODO -- Implement later, if needed
            }
        }
    }

    // So the above will need an additional ThirdPartyService mapping  
    //! These are all reduction functions
    //! These convert the GeneralContact back to the original service's object at the moment, which isn't needed at all because of the 
    //! originalContactObject thing. 
    // This will be called with the values being from the GeneralContact
    
    const customFieldFunctionMapping: ThirdPartyServiceMap<ThirdPartyServiceMap<{[key in GeneralContactField]: Maybe<(existingFields, currentValue) => Promise<any>>}>> = {
        [ThirdPartyService.Boulevard]: {
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
    
                [GeneralContactField.original_contact_object]: async (existingFields, originalContact: Client): Promise<any> => (
                    {
                        ...existingFields,
                        active: originalContact.active,
                        appointmentCount: originalContact.appointmentCount,
                        creditCardsOnFile: originalContact.creditCardsOnFile,
                        custom: originalContact.custom,
                        customFields: originalContact.customFields,
                        dob: originalContact.dob,
                        externalId: originalContact.externalId,
                        hasCardOnFile: originalContact.hasCardOnFile,
                        id: originalContact.id,
                        marketingSettings: originalContact.marketingSettings,
                        mergedIntoClientId: originalContact.mergedIntoClientId,
                        name: originalContact.name,
                        notes: originalContact.notes,
                        primaryLocation: originalContact.primaryLocation,
                        pronoun: originalContact.pronoun,
                        reminderSettings: originalContact.reminderSettings,
                        tags: originalContact.tags
                    }
                ),
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined
            },
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: await standardKeyValueDictionaryToPodiumTags,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
    
                // TODO -- use this to construct any special properties needed that aren't part of GeneralContact's columns 
                [GeneralContactField.original_contact_object]: async (existingFields, originalContact: Client): Promise<any> => {
                    const { firstName: _firstName, lastName: _lastName, name: _name } = originalContact
                    const firstName = standardEscapedString(_firstName)
                    const lastName = standardEscapedString(_lastName)
                    const name = standardEscapedString(_name)
                    
                    const key = fieldMapping[targetService][GeneralContactField.first_name]!

                    const hasFirstName = isPopulatedString(firstName)
                    const hasLastName = isPopulatedString(lastName)
                    const hasNameName = isPopulatedString(name)


                    const fullName = (firstName === "N/A" || (!hasFirstName && !hasLastName && !hasNameName)) ? "" : `${hasFirstName ? firstName : ""}${hasLastName ? `${hasFirstName ? " " : ""}${lastName}` : ""}`
                    // const fullName = `${hasFirstName ? firstName : ""}${hasLastName ? `${hasFirstName ? " " : ""}${lastName}` : ""}${!hasFirstName && !hasLastName ? name || "" : "" }`

                    return new Promise((resolve) => resolve({
                        ...existingFields,
                        [key]: fullName,
                    }))

                },
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            }
        },
        [ThirdPartyService.Podium]: {
            // TODO - From Podium to Boulevard
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined, 
                [GeneralContactField.last_name]: undefined, 
                [GeneralContactField.tags]: async (existingFields, tags: GeneralContactTags) => standardGeneralContactTagsToBoulevardTags(existingFields, tags, targetService, fieldMapping),
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                // TODO -- Any special fields
                [GeneralContactField.original_contact_object]: undefined,
                // async (existingFields, originalContact: Contact) => {

                //     const { attributes }: { attributes: ContactAttribute[] } = originalContact

                //     const birthdayAttribute = attributes.filter(({ label }: { label: string | undefined }) => (label || "").toLowerCase() === "birthday")

                //     return {
                //         ...existingFields,
                //         dob: birthdayAttribute.length > 0 ? typeof(birthdayAttribute[0].value) === 'string' ? birthdayAttribute[0].value : undefined : undefined,
                //     }
                // },
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined,
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined, 
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
    
                // TODO -- use this to construct any special stuff needed
                [GeneralContactField.original_contact_object]: async (existingFields, originalContact: Contact): Promise<any> => (
                    {
                        ...existingFields,
                        attributes: originalContact.attributes,
                        conversations: originalContact.conversations,
                        createdAt: originalContact.createdAt,
                        emails: originalContact.emails,
                        locations: originalContact.locations,
                        name: originalContact.name,
                        organization: originalContact.organization,
                        phoneNumbers: originalContact.phoneNumbers,
                        tags: originalContact.tags,
                        uid: originalContact.uid,
                        updatedAt: originalContact.updatedAt
                    }
                ),
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined,
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            }
        },
        // TODO
        [ThirdPartyService.GoHighLevel]: {
            [ThirdPartyService.Boulevard]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined,
                [GeneralContactField.tags]: async (existingFields, tags: GeneralContactTags) => standardGeneralContactTagsToBoulevardTags(existingFields, tags, targetService, fieldMapping),
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.Podium]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined,
                [GeneralContactField.tags]: await standardKeyValueDictionaryToPodiumTags,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            },
            [ThirdPartyService.GoHighLevel]: {
                [GeneralContactField.id]: undefined,
                [GeneralContactField.first_name]: undefined,
                [GeneralContactField.last_name]: undefined,
                [GeneralContactField.tags]: undefined,
                [GeneralContactField.emails]: undefined,
                [GeneralContactField.address]: undefined,
                [GeneralContactField.phone_numbers]: undefined,
                [GeneralContactField.original_service]: undefined,
                [GeneralContactField.original_contact_object]: undefined,
                [GeneralContactField.syncedWithService]: undefined,
                [GeneralContactField.created_at]: undefined,
                [GeneralContactField.updated_at]: undefined,
                [GeneralContactField.service_ids]: undefined,
                [GeneralContactField.birthdate]: undefined,
            }
        }
    }

    try {
        //@ts-ignore
        const newContactObject: ValidContactType = await allGeneralFields.reduce(async (accContact, currentFieldKey: string): Promise<any> => {
            const existingFields = await accContact
            

            const newFieldKey = fieldMapping[targetService][currentFieldKey]

            const currentValueConversion = valueConversionMapping[originalService][targetService][currentFieldKey]
            const hasCurrentValueConversion = typeof(currentValueConversion) !== 'undefined'

            const currentValueCustomFunction = customFieldFunctionMapping[originalService][targetService][currentFieldKey]
            const hasCurrentValueCustomFunction = typeof(currentValueCustomFunction) !== 'undefined'

            const hasNothing = /* !hasFieldMapping && */ !hasCurrentValueConversion && !hasCurrentValueCustomFunction
            
            // Completely ignore the current field
            if (hasNothing) return accContact

            const currentFieldValue = generalContact[currentFieldKey]

            const useCustomFunction = hasCurrentValueCustomFunction

            const returnValue = useCustomFunction ? currentValueCustomFunction(existingFields, currentFieldValue)
            : {
                ...existingFields,
                [newFieldKey]: currentValueConversion(currentFieldValue)
            }
    
            return new Promise((resolve) => resolve(returnValue))    
        }, {})

        return new Promise((resolve) => resolve(newContactObject as T))
    } catch (error) {
        console.error(`Could not convert database contact to ${targetService} contact`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}


export const storeGeneralContactInDatabase = async (originalService: ThirdPartyService, contact: GeneralContact): Promise<GeneralContact> => {

    try {
       const { rows } = await db.query(queries.insertGeneralContact(originalService, contact))

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not store contact in database`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGeneralContactInDatabase = async (contactId: string, contact: GeneralContact): Promise<GeneralContact> => {
    try {
        const { rows } = await db.query(queries.updateGeneralContact(contactId, contact))

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not update contact in database`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGeneralContactDeletedValue = async (contactId: string, deleted: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateGeneralContactDeletedValue(contactId, deleted))

        return new Promise((resolve) => resolve(true))

    } catch (error) {
        console.error(`Could not update deleted value for contact ${contactId} in database`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGeneralContactServiceIdsValue = async (contactId: string, serviceToModify: ThirdPartyService, idValue: Maybe<string>): Promise<boolean> => {

    try {
        const oldContact = await getGeneralContactWithPrimaryKey(contactId)
        const { service_ids } = oldContact!

        // const newValue = {
        //     ...service_ids,
        //     [serviceToModify]: idValue
        // }

        await db.query(queries.updateGeneralContactServiceIds(contactId, {
            ...service_ids,
            [serviceToModify]: typeof(idValue) !== 'undefined' && !Object.is(null, idValue) && (idValue ?? '').length > 0 ? idValue : oldContact!.service_ids[serviceToModify]
        }))

        return new Promise(resolve => resolve(true))
    } catch (error) {
        console.error(`Could not update service_ids for contact with primary key ${contactId} in database`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGeneralContactSyncedWithServicesValue = async (contactId: string, serviceToModify: ThirdPartyService, newValue: boolean): Promise<ThirdPartyServiceMap<boolean>> => {
    
    try {
        const contact = await getGeneralContactWithPrimaryKey(contactId)

        if (typeof(contact) === 'undefined') throw new Error(`Could not find contact with primary key ${contactId}`)

        const { synced_with_service: syncedWithService } = contact

        const newServicesValue = {
            ...syncedWithService,
            [serviceToModify]: newValue
        }

        await db.query(queries.updateGeneralContactSyncedWithServices(contactId, newServicesValue))

        return new Promise((resolve) => resolve(newServicesValue))
    } catch (error) {
        console.error(`Could not update synced with services values for contact with primary key ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateGeneralContactBirthdateValue = async (contactId: string, newBirthdate: Date, forceUpdate: boolean = false): Promise<boolean> => {
    try {
        const contact = await getGeneralContactWithPrimaryKey(contactId)
        
        if (typeof(contact) === 'undefined') throw new Error(`Could not find contact with primary key ${contactId}`)

        const { birthdate } = contact

        const birthdateAlreadyExists = typeof(birthdate) !== 'undefined' && !Object.is(birthdate, null)

        if (birthdateAlreadyExists && !forceUpdate) {
            // Birthdate already exists, not forcing update
            return new Promise((resolve) => resolve(true))
        }

        await db.query(queries.updateGeneralContactBirthdate(contactId, newBirthdate))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Could not update birthdate value for contact with primary key ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGeneralContactSyncedWithServicesValue = async (contactId: string): Promise<ThirdPartyServiceMap<boolean>> => {
    try {
        const contact = await getGeneralContactWithPrimaryKey(contactId)

        if (typeof(contact) === 'undefined') throw new Error(`Could not find contact with primary key ${contactId}`)

        const { synced_with_service: syncedWithService } = contact

        return new Promise((resolve) => resolve(syncedWithService))

    } catch (error) {
        console.error(`Could not get synced with services value for contact with primary key ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getGeneralContactWithOriginalID = async (originalService: ThirdPartyService, contactId: string): Promise<Maybe<GeneralContact>> => {
    try {
         const { rows } = await db.query(queries.getGeneralContactFromOriginalServiceID(originalService, contactId))

         if (typeof(rows) === "undefined") {
            throw new Error("rows is undefined")
        }

        if (rows.length <= 0) {
            return new Promise((resolve) => resolve(undefined))
        }
        
        if (rows.length > 1) throw new Error(`More than one contact found with the ${originalService} ${serviceIdKeys[originalService]} ${contactId}`)

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not get general contact with original id ${contactId}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))
    }
}

export const getGeneralContactPrimaryKeyWithServiceContactId = async (originalService: ThirdPartyService, contactId: string): Promise<Maybe<string>> => {
    try {
        const contact = await getGeneralContactWithOriginalID(originalService, contactId)

        if (typeof(contact) === "undefined") {
            return new Promise((resolve) => resolve(undefined))
        }

        if (typeof(contact.id) === "undefined") {
            return new Promise((resolve) => resolve(undefined))
        }
        
        return new Promise((resolve) => resolve(`${contact!.id}`))

    } catch (error) {
        console.error(`Could not get general contact with original id ${contactId}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))
    }
}

export const getGeneralContactPrimaryKeyFromOriginalContactObjectID = async (originalService: ThirdPartyService, contactId: string): Promise<Maybe<string>> => {
    try {
        const { rows } = await db.query(queries.getGeneralContactFromOriginalContactObjectID(originalService, contactId))

        if (typeof(rows) === "undefined") {
           throw new Error("rows is undefined")
       }

       if (rows.length <= 0) {
           return new Promise((resolve) => resolve(undefined))
       }
       
       if (rows.length > 1) throw new Error(`More than one contact found with the ${originalService} ${serviceIdKeys[originalService]} ${contactId}`)

       return new Promise((resolve) => resolve(`${rows[0]!.id}`))
    } catch (error) {
        console.error(`Could not get general contact with original contact object id ${contactId}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))
    }
}



export const getGeneralContactWithPrimaryKey = async (primaryKey: string): Promise<Maybe<GeneralContact>> => {
    try {
        const { rows } = await db.query(queries.getGeneralContactFromPrimaryKey(primaryKey))

        if (typeof(rows) === "undefined") {
            throw new Error("rows is undefined")
        }

        if (rows.length <= 0) {
            return new Promise((resolve) => resolve(undefined))
        }

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not get general contact with primary key ${primaryKey}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))
    }

}

export const getAllGeneralContacts = async (service: ThirdPartyService | undefined = undefined, withoutBirthdates: boolean = false, withBirthdates: boolean = false): Promise<GeneralContact[]> => {

    const serviceSpecific = typeof(service) !== "undefined"

    const nonSpecificQuery = withoutBirthdates ? queries.getAllGeneralContactsWithoutBirthdates : withBirthdates ? queries.getAllGeneralContactsWithBirthdates : queries.getAllGeneralContacts

    try {
        const { rows }: { rows: GeneralContact[] } = await db.query(serviceSpecific ? queries.getAllContactsForService(service) : nonSpecificQuery )

        if (typeof(rows) === "undefined") {
            throw new Error("rows is undefined")
        }

        return new Promise((resolve) => resolve(rows))

    } catch (error) {
        console.error(`Could not get all contacts from database`)
        console.error(error)

        return new Promise((resolve, reject) => reject(error))
    }
}


type GeneralContactFieldComparisonDictionary = {[key in GeneralContactField]: boolean}

// // TODO -- Test
// export const compareContacts = async (leftContact: GeneralContact, rightContact: GeneralContact): Promise<boolean> => {
//     //? Compare each contact's fields against the other's
//     //? Generate a {[key: GeneralContactField]: boolean} dictionary
//     //? Generate a boolean array from that key dictionary with Object.keys(dictionaryVariable)
//     //? Use andReduction to reduce the array to a single boolean
//     //? Return that boolean

//     const generalContactFieldIds = Object.values(GeneralContactField)

//     const comparisonDictionary = 
//     //@ts-ignore
//     generalContactFieldIds.reduce((acc: GeneralContactFieldComparisonDictionary, currentField: string): GeneralContactFieldComparisonDictionary => {
//         const fieldType = typeof(leftContact[currentField])

//         // Ignore the syncedWithService field
//         if (currentField === GeneralContactField.syncedWithService) return acc

//         const getValue = (contact: GeneralContact) => {
//             const isString = fieldType === "string"
//             const value = contact[currentField]
            
//             return isString ? value.toLowerCase() : value
//         }

//         return {
//             ...acc,
//             [currentField]: getValue(leftContact) === getValue(rightContact)
//         }

//     }, {})

//     const booleanArray: boolean[] = Object.keys(comparisonDictionary).reduce((acc: boolean[], currentField) => [
//         ...acc,
//         comparisonDictionary[currentField]
//     ], []) 

//     return new Promise((resolve) => andReduction(booleanArray))    
// }

export const getContactIdFromObject: ThirdPartyServiceMap<(contactObject: ValidContactType) => string> = {
    [ThirdPartyService.Boulevard]: (contactObject: ValidContactType) => `${(contactObject as Client).id}`,
    [ThirdPartyService.Podium]: (contactObject: ValidContactType) => (contactObject as Contact).uid,
    [ThirdPartyService.GoHighLevel]: (contactObject: ValidContactType) => {throw new Error("Not Implemented")},
}

export const checkIfContactIdExistsInDatabase = async (originalService: ThirdPartyService, contactId: string ): Promise<boolean> => {

    // Check the id for the contact received and compare it against
    // the id value in the database contact's 'original_contact_object' field

    try {
        const contact = await getGeneralContactWithOriginalID(originalService, contactId)

        return new Promise((resolve) => resolve(typeof(contact) !== "undefined"))
    } catch (error) {
        console.error(`Could not check if contact exists in database, id:`, contactId )
        console.error(error)

        return new Promise((resolve) => resolve(false))
    }
}

