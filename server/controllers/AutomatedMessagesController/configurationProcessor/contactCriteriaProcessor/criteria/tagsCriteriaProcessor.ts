import { andReduction } from "../../../../../helpers/ArrayFunctions";
import { GeneralContact } from "../../../../../model/GeneralContact";
import { AutomatedMessageTagsConfigEntry } from "../../../model/AutomatedMessageTagsConfigEntry";
import { AutomatedMessageCustomContactCriteria, ValidAutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { ContactCriteriaProcessorCheckObject } from "../../../model/CustomContactCriteria/ContactCriteriaProcessorCheckObject";
import { filterMappingErrorWrapper } from "../helpers/filterMappingErrorWrapper";
import { ContactCriteriaProcessorFilterMappingFunction } from "../model/ContactCriteriaProcessorFilterMappingFunction";
import { FilterMappingResult } from "../model/FilterMappingResult";

const tagsCriteriaProcessor: ContactCriteriaProcessorFilterMappingFunction = async (contact: GeneralContact, currentTime: Date, configDataAnalysisResult: ContactCriteriaProcessorCheckObject): Promise<FilterMappingResult<ValidAutomatedMessageCustomContactCriteria>> => {
    const {
        tags: tagsConfig
    } = configDataAnalysisResult

    return await filterMappingErrorWrapper(AutomatedMessageCustomContactCriteria.Tags,
        async () => {
            const { hasRequiredData, includes, excludes } = tagsConfig
            const { tags: contactTags } = contact

            if (!hasRequiredData) {
                throw new Error(`Contact criteria for ${AutomatedMessageCustomContactCriteria.Tags} is not configured correctly -- data missing`)
            }

            type _ReductionOutput = {
                result: boolean,
                matchingTags: string[]
            }

            const defaultObject = {
                result: true,
                matchingTags: []
            }

            const reductionFunction = async (acc: Promise<_ReductionOutput>, currentEntry: AutomatedMessageTagsConfigEntry): Promise<_ReductionOutput> => {
                const existing = await acc

                const { tags: entryTags } = currentEntry

                const tagsMatch: _ReductionOutput = Object.keys(contactTags).reduce((allMatches: _ReductionOutput, key: string): _ReductionOutput => {
                    const searchResult = entryTags.find(tag => tag === key)

                    const matchFound = typeof(searchResult) !== 'undefined'

                    return {
                        result: andReduction([allMatches.result, matchFound]),
                        matchingTags: matchFound ? [...allMatches.matchingTags, key] : allMatches.matchingTags 
                    }

                }, defaultObject as _ReductionOutput)

                const resultObject: _ReductionOutput = {
                    result: andReduction([tagsMatch.result, existing.result]),
                    matchingTags: [...existing.matchingTags, ...tagsMatch.matchingTags]
                }

                return new Promise((resolve) => resolve(resultObject))
            }

            //@ts-ignore
            const includesResult: _ReductionOutput = await (includes ?? []).reduce<_ReductionOutput>(reductionFunction, defaultObject)

            //@ts-ignore
            const excludesResult: _ReductionOutput = await (excludes ?? []).reduce(reductionFunction, defaultObject)

            return new Promise((resolve) => resolve({
                filterResult: andReduction([includesResult.result, !excludesResult.result]),
                data: {
                    tags: includesResult.matchingTags
                }
            }))

        }
    )
}

export default tagsCriteriaProcessor