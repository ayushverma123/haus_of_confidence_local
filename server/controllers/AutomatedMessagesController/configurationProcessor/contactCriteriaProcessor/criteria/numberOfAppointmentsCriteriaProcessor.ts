import { andReduction } from "../../../../../helpers/ArrayFunctions";
import { GeneralContact } from "../../../../../model/GeneralContact";
import { getAllDatabaseAppointmentsWithContactId } from "../../../../BoulevardAppointmentsTableController/getAllDatabaseAppointmentsWithContactId";
import { BoulevardAppointmentsTableRow } from "../../../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { AutomatedMessageContactCriteriaNumberOfAppointments } from "../../../model/CustomContactCriteria/AutomatedMessageContactCriteriaNumberOfAppointments";
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";
import { filterAppointmentsByModifiers } from "../../helpers/filterAppointmentsByModifiers";
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper";
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction";
import { FilterMappingResult } from "../model/FilterMappingResult";

const numberOfAppointmentsCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const {
        numberOfAppointments: numberOfAppointmentsConfig
    } = configDataAnalysisResult

    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.NumberOfAppointments,
        async () => {
            const { hasRequiredData, includes, excludes } = numberOfAppointmentsConfig

            let allAppointments: BoulevardAppointmentsTableRow[]

            try {
                const _allAppointments = await getAllDatabaseAppointmentsWithContactId(contact.id!)

                if (typeof(_allAppointments) === 'undefined') {
                    throw new Error(`Could not find any appointments for contact ${contact.id} -- Result is undefined`)
                }
                
                allAppointments = _allAppointments
                // console.log("CONTACT APPOINTMENTS COUNT: ", _allAppointments.length)

            } catch (error) {
                console.error(`Unable to retrieve number of appointments for contact ${contact.id}`)
                console.error(error)

                return new Promise((_, reject) => reject(error))
            }

            if (!hasRequiredData) {
                throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.NumberOfAppointments} is not configured correctly -- data missing`)
            }

            type _ReductionOutput = {
                result: boolean,
                numberOfAppointments: number
            }

            const defaultObject = {
                result: true,
                numberOfAppointments: 0
            }

            // console.group("NUMBER OF APPOINTMENTS:", allAppointments.length)

            const reductionFunction = async (acc: Promise<_ReductionOutput>, currentEntry: { numberOfAppointments: AutomatedMessageContactCriteriaNumberOfAppointments } ): Promise<_ReductionOutput> => {
                const { numberOfAppointments: { quantity, excludeCompleted, onlyCancelled, onlyCompleted, includeCancelled }} = currentEntry


                // console.log("CURRENT ENTRY")
                // console.log(currentEntry)

                const existing = await acc

                const filteredAppointments: BoulevardAppointmentsTableRow[] = filterAppointmentsByModifiers(
                    allAppointments,
                    excludeCompleted,
                    onlyCancelled,
                    onlyCompleted,
                    includeCancelled
                )

                // console.log(`FILTERED APPOINTMENTS (${filteredAppointments.length}):`)
                // console.log(filteredAppointments)

                return new Promise((resolve) => resolve({
                    result: andReduction([existing.result, filteredAppointments.length >= quantity]),
                    numberOfAppointments: filteredAppointments.length + existing.numberOfAppointments,
                }))
            }

            // const includesResult = await (includes ?? []).reduce(reductionFunction, defaultObject)
            const includesResult = await (() => {
                if (typeof(includes) === 'undefined') return { result: true }
                if (includes.length === 0) return { result: true }
                return includes.reduce(reductionFunction, defaultObject)
            })()

            const excludesResult = await (() => {
                if (typeof(excludes) === 'undefined') return { result: false }
                if (excludes.length === 0) return { result: false }
                return excludes.reduce(reductionFunction, defaultObject)
            })()
            // await (excludes ?? []).reduce(reductionFunction, defaultObject)

            // console.log("FINAL RESULT INCLUDES:") 
            // console.log(includesResult.result)

            // console.log("FINAL RESULTS: ")
            // console.log(includesResult)

            return new Promise((resolve) => resolve({
                filterResult: andReduction([includesResult.result, !excludesResult.result]),
                data: {
                    quantity: includesResult.numberOfAppointments
                }
            }))
        }
    )
}

export default numberOfAppointmentsCriteriaProcessor