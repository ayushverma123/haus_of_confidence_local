import { DBFieldType } from "./dbFieldTypes"

export enum InputFieldType {
    text,
    selection,
    number,
    boolean,
    url,
    email,
    password
}

export enum InputFieldPrimitiveType {
    text,
    number,
    selection
}

export interface InputFieldOptionRequired {
    required: boolean
}

export interface InputFieldOptionMinMaxLength {
    minLength?: number,
    maxLength?: number
}

export interface InputFieldOptionRegex {
    regex?: RegExp
}

export interface InputFieldOptionMinMaxValue {
    minValue?: number,
    maxValue?: number
}

export interface InputFieldOptionCustomFunction {
    custom?: (value: any) => boolean
}

export type InputFieldSelectionObjectSelectEntry = {
    key: string,
    value: string | boolean | number,
    text: string
}

export type InputFieldSelectionConfiguration = {
    selections?: InputFieldSelectionObjectSelectEntry[],
    // selectionFunction?: (selection: ValidationFieldSelectObject) => void
}

export type InputFieldOptions = InputFieldOptionRequired 
& InputFieldOptionMinMaxLength 
& InputFieldOptionRegex 
& InputFieldOptionMinMaxValue
// & ValidationFieldOptionCustomFunction
& InputFieldSelectionConfiguration
& {
    submitOnEnter?: boolean
}

export type InputField = {
    id: string,
    label: string,
    placeholderText?: string,
    inputType: InputFieldType,
    dbType?: DBFieldType 
    invalidInputMessage: string,
    options: InputFieldOptions,
    defaultValue?: string | number | boolean,
    submitOnEnter?: boolean
}

export type UIGeneratedFormInputConfiguration = InputField[]

export const getIdsFromInputConfiguration = (inputConfig: UIGeneratedFormInputConfiguration): string[] => inputConfig.map((item) => item.id)