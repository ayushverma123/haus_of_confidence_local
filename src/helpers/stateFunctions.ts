// Takes an array of number or string, and returns an object with the array items as keys with all
// keys assigned the defaultValue 

export type StateDictionary<T,> = {[key in string]: T}

export const defaultValueObjectWithIDs = <T,>(ids: string[], defaultValue: T): StateDictionary<any> => 
    ids.reduce((allItems, currentID) => (
        {
            ...allItems,
            [currentID]: defaultValue
        }
    ), {})

export const defaultValueObjectWithIDsGeneric = <valueType, keyType extends string | number | symbol>(
    enumValues: string[], 
    defaultValue: valueType
): {[key in keyType]: valueType} => 
    enumValues.reduce((allItems, currentID) => (
        {
            ...allItems,
            [currentID]: defaultValue
        }
    ), {}) as {[key in keyType]: valueType} 

export const defaultValueFromArrayObjectWithIDs = (ids: string[], defaultValues: string[] | number[] | boolean[]): StateDictionary<any> => 
    ids.reduce((allItems, currentID, index) => (
        {
            ...allItems,
            [currentID]: defaultValues[index]
        }
    ), {})