import React, { useState, useEffect, Fragment, ReactElement, useRef } from 'react'
import { getIdsFromInputConfiguration, UIGeneratedFormInputConfiguration, InputField, InputFieldSelectionObjectSelectEntry, InputFieldType } from '../../model/inputFields'
import { Dropdown, Form, Input, Label } from 'semantic-ui-react'
import { anyUrlRegex, emailRegex } from '../../helpers/commonRegex'
import { andReduction } from '../../helpers/arrayFunctions'
import { defaultValueObjectWithIDs, StateDictionary } from '../../helpers/stateFunctions'

export type FieldIdStyleMapping = {[key in string]: React.CSSProperties }

export const requiredCheck = (required: boolean, validityCheckResult: boolean) => required && validityCheckResult

export const generatedFormId = '__form__ '

//TODO: test

type Props = {
    inputConfig: UIGeneratedFormInputConfiguration,
    formDataHandler: (formData: StateDictionary<any>) => void, // Returns the state of the form to the parent
    setValidationState: (valid: boolean) => void,
    styleMapping?: FieldIdStyleMapping,
    newLineAfter?: string[], // Tells the code what elements to start a new line after
    showInvalidWithLabels?: boolean, // Labels show invalid status with a red color, disables inputbox error display
    useCustomLayout?: boolean,
    useCustomStyles?: boolean,
    formStyle?: React.CSSProperties,
    submitFunction: () => void,
    labelWidth?: string
}

export const UIGeneratedForm: React.FC<Props> = (props: Props) => {
    const { 
        inputConfig, 
        formDataHandler, 
        styleMapping, 
        newLineAfter, 
        setValidationState, 
        showInvalidWithLabels, 
        useCustomLayout,
        useCustomStyles,
        formStyle,
        submitFunction,
        labelWidth: overriddenLabelWidth
    } = props

    //#region State
    const [firstInteractionPerformed, setFirstInteractionPerformed] = useState<boolean>(false)
    const [inputIds,] = useState<string[]>(getIdsFromInputConfiguration(inputConfig))
    const [inputValues, setInputValues] = useState<StateDictionary<any>>((() => {
        const startingObject = defaultValueObjectWithIDs(inputIds, "")

        return Object.keys(startingObject).reduce((acc, key) => {
            const inputField: InputField = inputConfig.filter((item) => item.id == key)[0]
            const fieldType: InputFieldType = inputField.inputType
            const currentValue = startingObject[key]

            const returnDictionary: {[key in InputFieldType]: () => any} = {
                [InputFieldType.number]: () => currentValue,
                [InputFieldType.boolean]: () => {
                    if (key === 'enabled' || key === 'restrict_to_region') return true
                    else return false
                },
                [InputFieldType.selection]: () => {
                    const inputField: InputField = inputConfig.filter((item) => item.id == key)[0]
                    const selections: InputFieldSelectionObjectSelectEntry[] = inputField.options.selections!

                    return selections[0].key
                },
                [InputFieldType.text]: () => currentValue,
                [InputFieldType.email]: () => currentValue,
                [InputFieldType.url]: () => currentValue,
                [InputFieldType.password]: () => currentValue
            }

            return {
                ...acc,
                [key]: returnDictionary[fieldType]()
            }
        }, {})
    })())

    const [inputValidationStatus, setInputValidationStatus] = useState<StateDictionary<any>>(defaultValueObjectWithIDs(inputIds, false))
    const [focusedField, setFocusedField] = useState(inputIds.length > 0 ? inputIds[0] : "")
    const focusRef = useRef()
    //#endregion

    //#region Default Setters
    const defaultValueSetter = (value: any, fieldId: string) => 
        setInputValues((oldValues: any) => ({
            ...oldValues,
            [fieldId]: value
        }
    ))

    const defaultValidationSetter = (valid: boolean, fieldId: string) => 
        setInputValidationStatus((oldValues: any) => ({
            ...oldValues,
            [fieldId]: valid
        }
    ))
    //#endregion

    //#region Retain focus between renders and report validation and form data changes to the parent
    useEffect(() => {
        if (focusRef.current) {
            //@ts-ignore
            focusRef.current.focus() 
        }

        formDataHandler(inputValues)
        setValidationState(andReduction(Object.values(inputValidationStatus)))
    })
    //#endregion

    //#region Validate all fields initially
    useEffect(() => inputConfig.forEach((inputField: InputField) => defaultValidationSetter(validateInputField(inputField, ""), inputField.id)), [])
    //#endregion

    const longestLabelLength: number | undefined = !overriddenLabelWidth ? inputConfig.map(item => item.label).sort((a,b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0)[0].length : undefined
    const labelWidth: string = typeof(overriddenLabelWidth) !== 'undefined' ? overriddenLabelWidth : `${longestLabelLength! * 7.2}px`

    const validateInputField = (inputField: InputField, value: string | undefined = undefined): boolean => {
        const fieldType: InputFieldType = inputField.inputType
        const { minValue, maxValue, minLength, maxLength, regex, required } = inputField.options

        if (typeof(value) === 'undefined') {
            return !required
        }

        const validators: {[key in InputFieldType]: (value: string) => boolean} = {
            [InputFieldType.boolean]: (_: string) => true,
            [InputFieldType.email]: (value: string) => emailRegex.test(value.toLowerCase()),
            [InputFieldType.number]: (value: string): boolean => { 
                try {
                    const intValue = parseInt(value)
    
                    const hasMin: boolean = !(!minValue)
                    const hasMax: boolean  = !(!maxValue)
    
                    const atLeastMin: boolean = hasMin ? intValue >= minValue! 
                        : true
    
                    const noGreaterThanMax: boolean = hasMax ? intValue <= maxValue!
                        : true
    
                    return atLeastMin && noGreaterThanMax 
                } catch (error) {
                    return false
                }
            },
            [InputFieldType.selection]: (_: string) => true,
            [InputFieldType.text]: (value: string) => {
                const hasRegexp = !(!regex)
                const hasMinLength = !(!minLength)
                const hasMaxLength = !(!maxLength)
                
                if (hasRegexp) {
                    return regex!.test(value.toLowerCase())
                }

                return andReduction([
                    hasMinLength ? value.length >= minLength : true,
                    hasMaxLength ? value.length <= maxLength : true
                ])
            },
            
            [InputFieldType.url]: (value: string) => anyUrlRegex.test(value.toLowerCase()),
            [InputFieldType.password]: (value: string) => {
                return true
            }
        }

        const thisValidator = validators[fieldType]

        const _textRequireCheck = (): boolean => required ? value.length > 0 : true
        const requiredValueCheck: {[key in InputFieldType]: () => boolean} = {
            [InputFieldType.boolean]: () => true,
            [InputFieldType.email]: () => _textRequireCheck(),
            [InputFieldType.number]: () => true,
            [InputFieldType.password]: () => _textRequireCheck(),
            [InputFieldType.selection]: () => true,
            [InputFieldType.text]: () => _textRequireCheck(),
            [InputFieldType.url]: () => _textRequireCheck()
        }

        return required ? thisValidator(value) && requiredValueCheck[fieldType]() : 
            value.length > 0 ? thisValidator(value) : true
    }

    const inputComponentFactory = (inputField: InputField): ReactElement => {
        type defaultInputProps = {
            placeholder?: string,
            // label?: string,
            required?: boolean
        }
                
        type selectionProps = defaultInputProps & {
            options: InputFieldSelectionObjectSelectEntry[]
        } 
    
        type textProps = defaultInputProps & {
            numbers?: boolean,
            password?: boolean
        }
    
        const { id: fieldId, inputType: inputType, label, placeholderText, invalidInputMessage } = inputField
        const { selections, required, submitOnEnter } = inputField.options

        const fieldStyle: React.CSSProperties | undefined = styleMapping ? styleMapping[fieldId] ? styleMapping[fieldId] : undefined : undefined
    
        const valueGetter = () => inputValues[fieldId]
        const valueSetter = (value: any) => defaultValueSetter(value, fieldId)
    
        const isValidGetter = () => inputValidationStatus[fieldId]
        const isValidSetter = (valid: boolean) => defaultValidationSetter(valid, fieldId)

        const setFieldAsFocused = () => {
            setFocusedField(fieldId)
        }
    
        const standardHandleInputFieldValueChange = (value: any | undefined, setFocus: boolean) => {
            if (setFocus) {
                setFieldAsFocused()
            } else setFocusedField('')
            
            valueSetter(inputType === InputFieldType.number ? value.replace(/\D/g, '') : value)
            isValidSetter(
                validateInputField(inputField, value)
            )
        } 

        const generateFragmentKey = (id: number) => `__fragment${id}_${fieldId}`

        const hasInvalidData: boolean = !isValidGetter()
        const isFocused = fieldId === focusedField

        const inputFieldLabel: ReactElement = (
            <Label 
                color={hasInvalidData && showInvalidWithLabels ? 'red' : undefined} 
                style={{width: labelWidth}} 
                key={`__label__${fieldId}`}
            >
                {label}
            </Label>
        )

        const newLineField: ReactElement = (
            <Fragment key={generateFragmentKey(0)}>
                { newLineAfter?.includes(fieldId) && useCustomLayout &&<br key={`__newline__${fieldId}`}/> }
            </Fragment>
        )

        const internalSubmitFunction = (e: any) => {
            if (submitOnEnter) {
                const enterKeyPressed = e.key === 'Enter'
                if (enterKeyPressed) submitFunction()
            }
        }

        const DropdownBase: React.FC<selectionProps> = (props: selectionProps) => {
            const { placeholder, options, required} = props
            return (
                <Fragment key={generateFragmentKey(1)}>
                    { inputFieldLabel }
                    <Dropdown
                        placeholder={placeholder}
                        selection
                        options={options}
                        value={valueGetter()}
                        onChange={(e, { value }) => {
                            if (!firstInteractionPerformed) setFirstInteractionPerformed(true)
                            standardHandleInputFieldValueChange(value, false)
                        }}
                        onKeyUp={internalSubmitFunction}
                        error={showInvalidWithLabels ? undefined : hasInvalidData}
                        //@ts-ignore
                        ref={fieldId === focusedField ? focusRef : undefined}
                        required={required}
                        style={useCustomStyles ? fieldStyle : undefined}
                        key={`dropdownbase_${fieldId}`}
                    />
                    { newLineField }
                </Fragment>
            )
        }
    
        const TextInputBase: React.FC<textProps> = (props: textProps) => {
            const { placeholder, numbers, required, password } = props
    
            return (
                <Fragment key={generateFragmentKey(2)}>
                    <Input
                        // onFocus={() => setFieldAsFocused()}
                        label={inputFieldLabel}
                        type={numbers ? 'numbers' : password ? 'password' : 'text'}
                        // type='password'
                        placeholder={placeholder}    
                        value={valueGetter()}
                        onChange={(e) => {
                            if (!firstInteractionPerformed) setFirstInteractionPerformed(true)
                            standardHandleInputFieldValueChange(e.target.value, true)
                        }}
                        onClick={() => setFieldAsFocused()}
                        error={showInvalidWithLabels ? undefined : hasInvalidData}
                        required={required}
                        //@ts-ignore
                        ref={isFocused ? focusRef : undefined}
                        focus={isFocused}
                        onFocus={() => isFocused ? undefined : setFieldAsFocused()}
                        style={useCustomStyles ? fieldStyle : undefined}
                        key={`textinputbase_${fieldId}`}
                        onKeyUp={internalSubmitFunction}
                    />
                    { hasInvalidData && isFocused && firstInteractionPerformed &&
                        <Label basic color='red' pointing>{invalidInputMessage}</Label>
                    }
                    { newLineField }
                </Fragment>
            )
        }
    
        const allTextInputs = (numbers: boolean, required: boolean, isPassword: boolean = false) => (
            <TextInputBase
                placeholder={placeholderText}
                // label={label}
                numbers={numbers}
                required={required}
                key={`textinput_${fieldId}`}
                password={isPassword}
            />
        )
    
        const inputFieldTypeToComponentMapping: {[key in InputFieldType]: () => ReactElement} =
        {
            [InputFieldType.boolean]: () => (
                <DropdownBase
                    key={`dropdown_bool_${fieldId}`}
                    // label={label}
                    placeholder={placeholderText}
                    required={required}
                    options={[
                        {
                            key: '__bool__true__',
                            text: 'Yes',
                            value: true
                        },
                        {
                            key: '__bool__false__',
                            text: 'No',
                            value: false
                        }
                    ]}
                />
    
            ),
            [InputFieldType.email]: () => allTextInputs(false, required),
            [InputFieldType.number]: () => allTextInputs(true, required),
            [InputFieldType.password]: () => allTextInputs(false, required, true),
            [InputFieldType.selection]: () => (
                <DropdownBase
                    key={`dropdown_selection_${fieldId}`}
                    // label={label}
                    placeholder={placeholderText}
                    options={selections!}
                    required={required}
                />
            ),
            [InputFieldType.text]: () => allTextInputs(false, required),
            [InputFieldType.url]: () => allTextInputs(false, required)
        }
    
        return (
            <Form.Field key={`form_field_${fieldId}`}>
                { inputFieldTypeToComponentMapping[inputType]() }
            </Form.Field>

        )
    }

    const constructedForm = inputConfig.map((inputField: InputField): ReactElement => inputComponentFactory(inputField))

    return useCustomLayout ? (
        <div style={formStyle ? formStyle : undefined}>
            { constructedForm }
        </div>
    ) :
    (
        <Form style={formStyle ? formStyle : undefined}>
            { constructedForm }
        </Form>
    )
}