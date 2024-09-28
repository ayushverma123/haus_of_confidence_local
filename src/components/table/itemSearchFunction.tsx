import { andReduction, orReduction } from "../../helpers/arrayFunctions"
import { SearchType } from "../../model/searchType"
import { TableBodyDataItem, ValidTableBodyDataRowItemTypes } from "./model/TableBodyData"

export const itemSearchFunction = (searchType: SearchType, searchTerms: string[], item: TableBodyDataItem) => {
    // Will need to take a list of terms to match from a state object
    // Return items that include any of the terms
    
    if (searchTerms.length <= 0) {
        return true
    }

    //For each search filter term, check each key for that item, return results in an array, then combine that
    // array into one boolean using the orReduction, with this result being the final result for the filter
    const resultsArray: boolean[] = searchTerms.reduce((acc: boolean[], searchTerm: string): boolean[] => {
            
        const results = (() => {
            const currentProperty: ValidTableBodyDataRowItemTypes = item['item']

            const currentPropertyType = typeof(currentProperty)

            const typeToString: {[key in string]: () => string } = {
                'boolean': () => currentProperty ? 'yes' : 'no',
                'number': () => `${currentProperty}`,
                //@ts-ignore
                'string': () => currentProperty,
                //@ts-ignore
                'object': () => {
                    //@ts-ignore
                    if (typeof(currentProperty.length) === 'undefined') return ''
                    //@ts-ignore
                    if (currentProperty.length > 0) return currentProperty[0]
                    return ''
                }
            }
    
            const newValue: boolean = ((typeToString[currentPropertyType]()).toLowerCase()).includes(searchTerm.toLowerCase())

            return newValue

        })()

        return [
            ...acc,
            results
        ]
    }, [])

    const searchTypeResult: { [key in SearchType]: () => boolean } = {
        [SearchType.allTermsMustMatch]: () => andReduction(resultsArray),
        [SearchType.anyTermCanMatch]: () => orReduction(resultsArray)
    }

    return searchTypeResult[searchType]()
}