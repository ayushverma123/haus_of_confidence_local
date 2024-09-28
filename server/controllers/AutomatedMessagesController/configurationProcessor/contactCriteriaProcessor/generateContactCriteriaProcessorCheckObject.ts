import { Maybe } from "../../../../model/Maybe";
import { AutomatedMessageCustomIncludeExcludeConfigurationEntry } from "../../model/AutomatedMessageCustomIncludeExcludeConfigurationEntry";
import { AutomatedMessageCustomContactCriteria, AutomatedMessageCustomContactCriteriaConfiguration } from "../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { ContactCriteriaProcessorCheckObject } from "../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";


export type CheckForRequiredConfigDataResult = {[key in AutomatedMessageCustomContactCriteria]: Maybe<boolean> }

const configKeys = Object.values(AutomatedMessageCustomContactCriteria)

//? Anything that is not used will not have a key in the result
//? If use is true, will return true if include or exclude has at least one entry, and if both have none, then false
//? If use is false, the configKey's value will be undefined
export const checkForRequiredConfigData = (configuration: AutomatedMessageCustomContactCriteriaConfiguration) => {
    // TODO -- Every config entry will have the properties 'use', 'includes', and 'excludes'
    // TODO -- I should be able to iterate through each one of these using the AutomatedMessageCustomContactCriteria enum values
    // TODO -- check the 'use' value, if it is true, then check the 'includes' and 'excludes' values are not both length = 0
    // TODO -- Return object will be {[key in AutomatedMessageCustomContactCriteria]: boolean}

    const result: CheckForRequiredConfigDataResult = configKeys.reduce((acc: CheckForRequiredConfigDataResult, configKey: string): CheckForRequiredConfigDataResult => {
        const configEntry: Maybe<AutomatedMessageCustomIncludeExcludeConfigurationEntry<any, any>> = configuration[configKey]

        if (typeof(configEntry) === 'undefined') {
            // Don't even add the key to the result object
            return acc
        }

        const { use, includes, excludes } = configuration[configKey]

        return {
            ...acc,
            [configKey]: use ? !(includes.length <= 0 && excludes.length <= 0) : true
        } 
    }, {} as CheckForRequiredConfigDataResult)

    return result
}

const requiredDataExceptions: AutomatedMessageCustomContactCriteria[] = [
    AutomatedMessageCustomContactCriteria.Birthdate
]

export const generateContactCriteriaProcessorCheckObject = (configuration: AutomatedMessageCustomContactCriteriaConfiguration): ContactCriteriaProcessorCheckObject => 
    configKeys.reduce((acc: ContactCriteriaProcessorCheckObject, configKey: string): ContactCriteriaProcessorCheckObject => {
        const configEntry: Maybe<AutomatedMessageCustomIncludeExcludeConfigurationEntry<any, any>> = configuration[configKey]

        if (typeof(configEntry) === 'undefined') {
            // Don't even add the key to the result object
            return acc
        }

        const { use, includes, excludes } = configuration[configKey]

        return {
            ...acc,
            [configKey]: {
                // use,
                hasRequiredData: use ? requiredDataExceptions.includes(configKey as AutomatedMessageCustomContactCriteria) ? true : !(includes.length <= 0 && excludes.length <= 0) : true,
                // hasIncludes: includes.length > 0,
                // hasExcludes: excludes.length > 0,
                includes,
                excludes
            }
        }
    }, {} as ContactCriteriaProcessorCheckObject)