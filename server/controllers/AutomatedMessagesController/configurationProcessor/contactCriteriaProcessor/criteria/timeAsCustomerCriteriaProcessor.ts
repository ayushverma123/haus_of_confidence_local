import { intervalToDuration } from "date-fns";
import { andReduction } from "../../../../../helpers/ArrayFunctions";
import { AutomatedMessageContactCriteriaTimeAsCustomer } from "../../../model/CustomContactCriteria/AutomatedMessageContactCriteriaTimeAsCustomer";
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { addTimeToDate } from "../../helpers/addTimeToDate";
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper";
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction";
import { GeneralContact } from "../../../../../model/GeneralContact";
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";
import { FilterMappingResult } from "../model/FilterMappingResult";

const timeAsCustomerCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const {
        timeAsCustomer: timeAsCustomerConfig
    } = configDataAnalysisResult

    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.TimeAsCustomer,
        async () => {
            //? This one is basically "Has the customer been a customer for this long"
            const { hasRequiredData, includes, excludes } = timeAsCustomerConfig

            const currentDate = currentTime
            
            if (!hasRequiredData) {
                throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.TimeAsCustomer} is not configured correctly -- data missing`)
            }

            const reductionFunction = async (acc: Promise<boolean[]>, currentEntry: AutomatedMessageContactCriteriaTimeAsCustomer): Promise<boolean[]> => {
                const existing = await acc

                // console.log("CURRENT ENTRY")
                // console.log(currentEntry)

                const { timeAsCustomer } = currentEntry

                // Get the values from timeAsCustomer as offsets to apply to the contact's creation date
                // Create a new date that is the date this contact will have been a customer for that long
                const futureDate = await addTimeToDate(contact.created_at, timeAsCustomer)

                // Compare the current date to the date above, and return true if the current date is greater than or equal to the date above
                const timeHasPassed = currentDate.toISOString() >= futureDate.toISOString()

                return new Promise((resolve) => resolve([
                    ...existing,
                    timeHasPassed
                ]))

            }

            const includesResult = await (includes ?? []).reduce(reductionFunction, [])
            // console.log("includesResult:", includesResult)
            
            const excludesResult = await (excludes ?? []).reduce(reductionFunction, []).map(item =>!item)
            // console.log("excludesResult:", excludesResult)

            const filterBoolean = andReduction([...includesResult,...excludesResult])
            // console.log("FILTER BOOLEAN", filterBoolean)

            const duration: Duration = intervalToDuration({
                start: contact.created_at,
                end: currentDate
            } )
            
            //TODO -- Reduce array of keys of Duration object
            // TODO -- All Keys that return an empty or 0 value from the configuration object should be set to 0 in the duration object

            //@ts-ignore
            const finalDuration = (includes ?? []).length <= 0 ? duration : Object.keys(duration).reduce((acc: Duration, key: TimeUnit): Duration => {
                const { timeAsCustomer: _timeAsCustomer }: AutomatedMessageContactCriteriaTimeAsCustomer = includes[0]
                
                // Get the value at key or return 0 if undefined
                const _configValue = _timeAsCustomer[key] ?? 0

                return {
                    ...acc,
                    [key]: _configValue > 0 ? duration[key] : undefined
                    
                }
            }, {} as Duration)

            // console.log("DURATION")
            // console.log(finalDuration)


            return new Promise((resolve) => resolve({
                filterResult: filterBoolean,
                data: {
                    timeAsCustomer: finalDuration 
                }
            }))
        }
    )
}

export default timeAsCustomerCriteriaProcessor