import { GeneralContact } from "../../../../../model/GeneralContact"
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration"
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject"
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper"
import { handleSpecificDateConfigurations } from "../helpers/handleSpecificDateConfigurations"
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction"
import { FilterMappingResult } from "../model/FilterMappingResult"

const birthdateCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const { 
        birthdate: birthdateConfig, 
    } = configDataAnalysisResult

    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Birthdate,
        async () => handleSpecificDateConfigurations(currentTime, birthdateConfig, true, contact)
    )
}

export default birthdateCriteriaProcessor