import { ErrorCheckTuple } from "../model/ErrorCheck";

export const errorCheckTupleToBooleanArray = (array: ErrorCheckTuple[]): boolean[] => 
    array.map(item => item[0])

export const getErrorsFromErrorCheckTupleArray = (array: ErrorCheckTuple[]): ErrorCheckTuple[] => 
    array.filter((item) => item[0])

export const generateStringFromErrorCheckTupleArray = (array: ErrorCheckTuple[]): string => 
    array.reduce((acc, cv: ErrorCheckTuple) => `${acc}•${cv[1]} \n`, "")