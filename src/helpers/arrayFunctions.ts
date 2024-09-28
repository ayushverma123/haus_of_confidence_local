export const andReduction = (booleanArray: boolean[]): boolean => 
    booleanArray.reduce((acc: boolean, cv: boolean) => acc && cv, true)
    
export const orReduction = (booleanArray: boolean[]): boolean => 
    booleanArray.reduce((acc: boolean, cv: boolean) => acc || cv, false)