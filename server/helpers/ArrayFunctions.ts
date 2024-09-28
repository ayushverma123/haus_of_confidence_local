export const andReduction = (booleanArray: boolean[]): boolean => 
    booleanArray.reduce((acc: boolean, cv: boolean) => acc && cv, true)
    
export const orReduction = (booleanArray: boolean[]): boolean => 
    booleanArray.reduce((acc: boolean, cv: boolean) => acc || cv, false)

export const generateNumberRange = (start: number, endPlusOne: number): number[] => 
    Array.from(Array(endPlusOne - start).keys()).map(index => start + index)

export const convertArrayToSet = <T,>(arrayOfItems: T[]): Set<T> => arrayOfItems.reduce((acc: Set<T>, cv: T): Set<T> => acc.add(cv), new Set<T>())