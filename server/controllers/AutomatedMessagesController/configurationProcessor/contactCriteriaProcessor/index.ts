
import { andReduction } from "../../../../helpers/ArrayFunctions"
import { GeneralContact } from "../../../../model/GeneralContact"
import { ContactCriteriaFunctionReturn, GeneralContactIDToAutomatedMessageDataObjectMap } from "../../model/AutomatedMessageConfigurationEntry"
import { AutomatedMessageSpecificDateConfigurationEntry } from "../../model/AutomatedMessageSpecificDate"
import { AutomatedMessageContactCriteriaAppointmentEntry } from "../../model/CustomContactCriteria/AutomatedMessageContactCriteriaAppointment"
import { AutomatedMessageContactCriteriaNumberOfAppointments } from "../../model/CustomContactCriteria/AutomatedMessageContactCriteriaNumberOfAppointments"
import { AutomatedMessageContactCriteriaTimeAsCustomer } from "../../model/CustomContactCriteria/AutomatedMessageContactCriteriaTimeAsCustomer"
import { AutomatedMessageCustomContactCriteria, AutomatedMessageCustomContactCriteriaConfiguration, AutomatedMessageCustomContactCriteriaMapping, ValidAutomatedMessageCustomContactCriteria } from "../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration"
import { ContactCriteriaProcessorCheckObject } from "../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject"
import { generateContactCriteriaProcessorCheckObject } from "./generateContactCriteriaProcessorCheckObject"
import { Maybe } from "../../../../model/Maybe"
import { getCurrentTimeWithTimezone } from "../../../../helpers/getCurrentTimeWithTimezone"
import { FilterMappingResult as _FilterMappingResult } from "./model/FilterMappingResult"
import { ContactCriteriaProcessorFilterMappingFunction } from "./model/ContactCriteriaProcessorFilterMappingFunction"
import birthdateCriteriaProcessor from "./criteria/birthdateCriteriaProcessor"
import specificDateCriteriaProcessor from "./criteria/specificDateCriteriaProcessor"
import appointmentCriteriaProcessor from "./criteria/appointmentCriteriaProcessor"
import tagsCriteriaProcessor from "./criteria/tagsCriteriaProcessor"
import numberOfAppointmentsCriteriaProcessor from "./criteria/numberOfAppointmentsCriteriaProcessor"
import timeAsCustomerCriteriaProcessor from "./criteria/timeAsCustomerCriteriaProcessor"

export const contactCriteriaProcessor = async (configuration: AutomatedMessageCustomContactCriteriaConfiguration, allContacts: GeneralContact[]): Promise<ContactCriteriaFunctionReturn> => {
    const configDataAnalysisResult: ContactCriteriaProcessorCheckObject = generateContactCriteriaProcessorCheckObject(configuration)
    // const { 
    //     // name: nameConfig, 
    //     // email: emailConfig, 
    //     // phone: phoneConfig, 
    //     birthdate: birthdateConfig, 
    //     specificDate: specificDateConfig, 
    //     appointment: appointmentConfig, 
    //     tags: tagsConfig, 
    //     numberOfAppointments: numberOfAppointmentsConfig, 
    //     timeAsCustomer: timeAsCustomerConfig 
    // } = configDataAnalysisResult

    const configKeys = Object.keys(configDataAnalysisResult)

    const currentTime = getCurrentTimeWithTimezone()


    // TODO - TEST and FINISH APPOINTMENTS
    const filterMapping: {[key in AutomatedMessageCustomContactCriteria]: ContactCriteriaProcessorFilterMappingFunction } = {
        //#region Unneeded Criteria Filters
        // [AutomatedMessageCustomContactCriteria.Name]: async (contact: GeneralContact): Promise<_FilterMappingResult<AutomatedMessageContactCriteriaName>> => 
        //     await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Name,
        //         async () => {
        //             const { hasRequiredData, includes, excludes } = nameConfig
        //             const { first_name, last_name } = contact

        //             const verifyValue = (value?: string ) => {
        //                 if (typeof(value) === 'undefined' || Object.is(value, null)) return false
        //                 if (typeof(value) !== 'string') return false
        //                 if (value.length <= 0) return false
        //                 if (value === '') return false

        //                 return true
        //             }

        //             const hasFirstName = verifyValue(first_name)
        //             const hasLastName = verifyValue(last_name)

        //             if (!hasFirstName && !hasLastName) {
        //                 return {
        //                     filterResult: false,
        //                     // data: {
        //                     //     firstName: first_name,
        //                     //     lastName: last_name
        //                     // }
        //                 }
        //             }

        //             if (!hasRequiredData) {
        //                 throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Name} is not configured correctly -- data missing`)
        //             }

        //             const reductionFunction = async (acc: Promise<boolean>, currentEntry: AutomatedMessageContactCriteriaName): Promise<boolean> => {
        //                 const existing = await acc

        //                 const { firstName: _firstName, lastName: _lastName} = currentEntry

        //                 const _hasFirstName = verifyValue(_firstName)
        //                 const _hasLastName = verifyValue(_lastName)


        //                 const checkFirstName = _hasFirstName && hasFirstName
        //                 const checkLastName = _hasLastName && hasLastName

        //                 const areStringsEqual = (value1: string, value2: string) => value1.toLowerCase() === value2.toLowerCase()

        //                 const resultMap: {[checkFirstName: number]: {[checkLastName: number]: () => boolean}} = {
        //                     0: {
        //                         // No First name, no last name
        //                         0: (): boolean => false,
        //                         // No first name, has last name
        //                         1: (): boolean => areStringsEqual(_lastName, last_name!),
        //                     },
        //                     1: {
        //                         // Has first name, no last name
        //                         0: (): boolean => areStringsEqual(_firstName, first_name!),
        //                         // Has first name, has last name
        //                         1: (): boolean => areStringsEqual(_firstName, first_name!) && areStringsEqual(_lastName, last_name!)
        //                     }
        //                 }

        //                 console.log("RESULT MAP RESULT:")
        //                 console.log(resultMap[booleanToNumber(checkFirstName)][booleanToNumber(checkLastName)]())
        //                 return new Promise((resolve) => resolve(andReduction([existing, resultMap[booleanToNumber(checkFirstName)][booleanToNumber(checkLastName)]()])))
        //             }

        //             const includesResult = await (() => {
        //                 if (typeof(includes) === 'undefined') return true
        //                 if (includes.length === 0) return true
        //                 return includes.reduce(reductionFunction, [])
        //             })()

        //             const excludesResult = await (() => {
        //                 if (typeof(excludes) === 'undefined') return false
        //                 if (excludes.length === 0) return false
        //                 return excludes.reduce(reductionFunction, [])
        //             })()

        //             return new Promise((resolve) => resolve({
        //                 filterResult: andReduction([includesResult, !excludesResult]),
        //                 data: {
        //                     firstName: first_name,
        //                     lastName: last_name
        //                 }
        //             }))
        //         }),
        // [AutomatedMessageCustomContactCriteria.Email]: async (contact: GeneralContact): Promise<_FilterMappingResult<AutomatedMessageContactCriteriaEmail>> => 
        //     await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Email,
        //         async () => {
        //             const { hasRequiredData, includes, excludes } = emailConfig
        //             const { emails } = contact

        //             if (!hasRequiredData) {
        //                 throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Email} is not configured correctly -- data missing`)
        //             }

        //             const reductionFunction = async (acc: Promise<boolean[]>, currentEntry: AutomatedMessageContactCriteriaEmail): Promise<boolean[]> => {
        //                 const existing = await acc

        //                 const { email } = currentEntry

        //                 const emailMatch = emails.includes(email)

        //                 return new Promise((resolve) => resolve([...existing, emailMatch]))

        //             }

        //             const includesResult = await (includes ?? []).reduce(reductionFunction, [])
        //             const excludesResult = await (excludes ?? []).reduce(reductionFunction, []).map(item =>!item)

        //             return new Promise((resolve) => resolve({ 
        //                 filterResult: andReduction([...includesResult, ...excludesResult]),
        //                 data: emails.length > 0 ? {
        //                     email:  emails[0],
        //                 } : undefined
        //             }))

        //         }),
        // [AutomatedMessageCustomContactCriteria.Phone]: async (contact: GeneralContact): Promise<_FilterMappingResult<AutomatedMessageContactCriteriaPhoneNumber>> => 
        //     await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Phone,
        //         async () => {
        //             const { hasRequiredData, includes, excludes } = phoneConfig
        //             const { phone_numbers } = contact

        //             if (!hasRequiredData) {
        //                 throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Phone} is not configured correctly -- data missing`)
        //             }

        //             const reductionFunction = async (acc: Promise<boolean[]>, currentEntry: AutomatedMessageContactCriteriaPhoneNumber): Promise<boolean[]> => {
        //                 const existing = await acc

        //                 const { phone } = currentEntry

        //                 const phoneMatch = phone_numbers.includes(phone)

        //                 return new Promise((resolve) => resolve([...existing, phoneMatch]))

        //             }

        //             const includesResult = await (includes ?? []).reduce(reductionFunction, [])
        //             const excludesResult = await (excludes ?? []).reduce(reductionFunction, []).map(item =>!item)

        //             return new Promise((resolve) => resolve({
        //                 filterResult: andReduction([...includesResult,...excludesResult]),
        //                 data: phone_numbers.length > 0? {
        //                     phone: phone_numbers[0],
        //                 } : undefined
        //             }))

        //         }),
        //#endregion
        [AutomatedMessageCustomContactCriteria.Birthdate]: birthdateCriteriaProcessor,
        [AutomatedMessageCustomContactCriteria.SpecificDate]: specificDateCriteriaProcessor,
        [AutomatedMessageCustomContactCriteria.Appointment]: appointmentCriteriaProcessor,
        [AutomatedMessageCustomContactCriteria.Tags]: tagsCriteriaProcessor,
        [AutomatedMessageCustomContactCriteria.NumberOfAppointments]: numberOfAppointmentsCriteriaProcessor,
        [AutomatedMessageCustomContactCriteria.TimeAsCustomer]: timeAsCustomerCriteriaProcessor,
    }


    //! I can iterate through the results above while processing the stuff below
    //! Just DO NOT delete the commented stuff in case it's needed for some reason
    //! Using the values of the AutomatedMessageCustomContactCriteria enum as the keys for the object below should simplify code a bit
    //! when checking things, the ultimate return value from the function should be the true / false values the filter below will expect

    // TODO -- Use a filter statement on the contacts / appointments
    // TODO -- each criteria needs to produce a boolean value
    // TODO -- The final result should be the andReduction of all those boolean values in an array, to determine if the current entry is to be included
    type _FilterContactsResult = {
        contacts: GeneralContact[],
        data: GeneralContactIDToAutomatedMessageDataObjectMap,
        error: {[key: number]: Maybe<any[]>}
    }

    type _BooleanChainResult = {
        filter: boolean[],
        data: AutomatedMessageCustomContactCriteriaMapping<Maybe<ValidAutomatedMessageCustomContactCriteria>>,
        error: any[],
        excludeContact?: boolean
    }
    //@ts-ignore
    const filteredContacts: _FilterContactsResult = await allContacts.reduce(async (filteredContactsResult: Promise<_FilterContactsResult>, contact: GeneralContact): Promise<_FilterContactsResult> => {
        const existingFilteredContacts = await filteredContactsResult

        const { id } = contact

        if (typeof(id) === 'undefined') {
            throw new Error(`Could not find contact id for contact`)
        }

        // console.log("CONFIG KEYS")
        // console.log(configKeys)

        try {
            //@ts-ignore
            const booleanChain: _BooleanChainResult = await configKeys.reduce(async (acc: Promise<_BooleanChainResult>, key: string): Promise<_BooleanChainResult> => {
                const existingBooleanChain = await acc
    
                try {

                    // console.log("FILTERMAPPING TYPE:" , typeof(filterMapping[key as AutomatedMessageCustomContactCriteria])) 

                    //! -- Alter this one lol
                    const filterMappingResult = await filterMapping[key as AutomatedMessageCustomContactCriteria](contact, currentTime, configDataAnalysisResult)

                    // console.log("FILTERMAPPING")
                    // console.log(filterMappingResult)

                    const { filterResult: filter, data, excludeContact } = filterMappingResult

                    const hasExcludeContact = typeof(excludeContact) !== 'undefined'
                    const shouldExcludeContact = hasExcludeContact && excludeContact

                    // console.log("SHOULD EXCLUDE CONTACT", shouldExcludeContact)

                    // console.log("FILTER DATA:")
                    // console.log(data)
    
                    return new Promise((resolve) => resolve({
                        filter: [...existingBooleanChain.filter, filter],
                        data: existingBooleanChain.data.set(key as AutomatedMessageCustomContactCriteria, data),
                        error: existingBooleanChain.error,
                        excludeContact: shouldExcludeContact
                    }))
                } catch (error) {
                    console.error(`Failed to filter Contact: ${contact.id} with criteria ${key} `)
                    console.error(error)

                    return new Promise((resolve) => resolve({
                        filter: [...existingBooleanChain.filter, false ],
                        data: existingBooleanChain.data,
                        excludeContact: true,
                        error: [
                            ...existingBooleanChain.error,
                            error
                        ]
                    }))
                }
            }, {
                filter: [],
                data: new Map(),
                error: []
            } as _BooleanChainResult)

            
            const { filter: _filterResult, data: booleanChainData, error: booleanChainError, excludeContact } = booleanChain

            const hasExcludeContact = typeof(excludeContact) !== 'undefined'
            const shouldExcludeContact = hasExcludeContact && excludeContact

            const filterResult = andReduction(_filterResult)

            // console.log("BOOLEAN CHAIN RESULT:")
            // console.log(booleanChain)

            // console.log("FILTER RESULT")
            // console.log(_filterResult)

            if (!filterResult) {
                return new Promise((resolve) => resolve(existingFilteredContacts))
            }

            const appointment = booleanChainData.get(AutomatedMessageCustomContactCriteria.Appointment)
            const numberOfAppointments = booleanChainData.get(AutomatedMessageCustomContactCriteria.NumberOfAppointments)
            const timeAsCustomer = booleanChainData.get(AutomatedMessageCustomContactCriteria.TimeAsCustomer)
            const birthdate = booleanChainData.get(AutomatedMessageCustomContactCriteria.Birthdate)

            const hasAppointment = typeof(appointment) !== 'undefined'
            const hasNumberOfAppointments = typeof(numberOfAppointments) !== 'undefined'
            const hasTimeAsCustomer = typeof(timeAsCustomer) !== 'undefined'
            const hasBirthdate = typeof(birthdate) !== 'undefined'

            // console.log("BOOLEAN CHAIN DATA")
            // console.log(booleanChainData)

            // console.log('hasAppointment:', hasAppointment)
            // console.log('hasNumberOfAppointments:', hasNumberOfAppointments)
            // console.log('hasTimeAsCustomer:', hasTimeAsCustomer)
            // console.log('hasBirthdate:', hasBirthdate)

            // console.log("Appointment:") //, appointment)
            // console.log(appointment)
            // console.log("NumberOfAppointments:", numberOfAppointments)
            // console.log("TimeAsCustomer:", timeAsCustomer)
            // console.log("Birthdate:", birthdate)

            const extraData = {
                appointment: hasAppointment ? (appointment as AutomatedMessageContactCriteriaAppointmentEntry).appointments![0] ?? undefined : undefined,
                numberOfAppointments: hasNumberOfAppointments ? (numberOfAppointments as AutomatedMessageContactCriteriaNumberOfAppointments).quantity : undefined,
                timeAsCustomer: hasTimeAsCustomer ? (timeAsCustomer as AutomatedMessageContactCriteriaTimeAsCustomer).timeAsCustomer : undefined,
                birthdate: hasBirthdate ? (birthdate as AutomatedMessageSpecificDateConfigurationEntry).date : undefined
            }

            // console.log("EXTRA DATA")
            // console.log(extraData)

            return new Promise((resolve) => resolve({
                contacts: !shouldExcludeContact /* && filterResult */ ? [
                    ...existingFilteredContacts.contacts,
                    contact                    
                ] : existingFilteredContacts.contacts,
                data: !shouldExcludeContact /* && filterResult */ ? {
                    ...existingFilteredContacts.data,
                    [id]: typeof(existingFilteredContacts.data[id]) === 'undefined' ? {
                        hasData: {
                            contact: true,
                            appointment: hasAppointment
                        },
                        currentTime,
                        data: {
                            contact,
                            ...extraData
                        }
                    } : {
                        hasData: {
                            contact: true,
                            appointment: hasAppointment
                        },
                        currentTime,
                        data: {
                            contact,
                            ...extraData
                        }
                    }
                } as GeneralContactIDToAutomatedMessageDataObjectMap : existingFilteredContacts.data,
                error: typeof(booleanChainError) !== 'undefined' && !Object.is(booleanChainError, null) ? 
                    (booleanChainError ?? []).length > 0 
                        ? {
                            ...existingFilteredContacts.error,
                            [id]: booleanChainError
                        } : existingFilteredContacts.error : existingFilteredContacts.error 
            }))

        } catch (error) {
            console.error(`Failed to compile data for contact: ${id}`)
            console.error(error)

            return new Promise((resolve) => resolve({
                ...existingFilteredContacts,
                error: {
                  ...existingFilteredContacts.error,
                    [id]: error
                }
            } as _FilterContactsResult))
        }
    }, {
        contacts: [],
        data: {},
        error: {}
    })
    
    console.log("FILTERED CONTACTS DATA")
    console.log(filteredContacts)

    return new Promise((resolve, reject) => resolve({
        contacts: filteredContacts.contacts,
        data: filteredContacts.data,
        error: filteredContacts.error
    }))
}
