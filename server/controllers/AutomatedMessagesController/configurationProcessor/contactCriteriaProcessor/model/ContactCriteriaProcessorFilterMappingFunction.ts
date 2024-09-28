import { GeneralContact } from "../../../../../model/GeneralContact";
import { ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";
import { FilterMappingResult } from "./FilterMappingResult";

export type ContactCriteriaProcessorFilterMappingFunction = (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject) => Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>>