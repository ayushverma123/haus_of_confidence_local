import { GeneralContact } from "../../../../../model/GeneralContact";
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper";
import { handleSpecificDateConfigurations } from "../helpers/handleSpecificDateConfigurations";
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction";
import { FilterMappingResult } from "../model/FilterMappingResult";

const specificDateCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const {
        specificDate: specificDateConfig
    } = configDataAnalysisResult
    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.SpecificDate, 
        async () => handleSpecificDateConfigurations(currentTime, specificDateConfig, false, contact))
}

export default specificDateCriteriaProcessor