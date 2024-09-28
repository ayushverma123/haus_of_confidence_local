import { AutomatedMessageCustomContactCriteria } from "../../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration"

export const filterMappingErrorWrapper = async <T,>(criteriaType: AutomatedMessageCustomContactCriteria, wrappedFunction: any): Promise<T> => {
    try {
       const result = await wrappedFunction()
       return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error(`Could not process contact criteria for ${criteriaType}`)
        console.error(error)
        
        return new Promise((_, reject) => reject(error))
    }
}
