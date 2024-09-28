export const generateOptionalInsertData = (optionalParametersBooleanCheck:  boolean[], optionalParametersValues: any, requiredValues: any): { optionsParameters: string[],  optionsValues } => {
    //@ts-ignore
    const optionsParameters = generateOptionalParameterStrings(optionalParametersBooleanCheck, requiredValues) 
    //optionalParametersBooleanCheck.reduce((acc, cv) => cv ? [...acc, acc.length + (requiredValues.length + 1)] : acc, []).map(item => `$${item}`)

    return {
        optionsParameters,
        //@ts-ignore
        optionsValues: optionalParametersBooleanCheck.reduce((acc, cv, index) => {
            return cv ? [...acc, optionalParametersValues[index]] : acc
        }, [])
    }
}
export const generateOptionalParameterStrings = (optionalParametersBooleanCheck:  boolean[], requiredValues: any) => 
    //@ts-ignore
    optionalParametersBooleanCheck.reduce((acc, cv) => 
        //@ts-ignore
        cv ? [...acc, acc.length + (requiredValues.length + 1)] : acc, []).map(item => `$${item}`)

export const generateOptionalValuesData = (optionalParametersBooleanCheck: boolean[], optionalParametersValues: any[]) => 
//@ts-ignore
    optionalParametersBooleanCheck.reduce((acc, cv, index) => {
        return cv ? [...acc, optionalParametersValues[index]] : acc
    }, [])

export const generateOptionalColumnNames = (optionalParametersBooleanCheck: boolean[], optionalColumnNames: string[]) => 
    optionalParametersBooleanCheck.reduce((acc, cv, index) => 
        cv ? [...acc, optionalColumnNames[index]] : acc
    , [] as string[])

export const generateOptionalQueryUpdateTextSection = (
    optionalParametersBooleanCheck: boolean[],
    columnNames: string[],
    requiredValues: any[]
) => {
    type _internalType = {
        _result: string,
        _index: number
    }

    const { _index, _result } = optionalParametersBooleanCheck.reduce((acc: _internalType, cv: boolean, index: number): _internalType => {
        const first = acc._index === 1
        const _index = cv ? 1 + acc._index : acc._index

        const columnName = columnNames[index]

        const _result =  cv ? `${acc._result} ${first ? 'SET' : ','} ${columnName} = $${_index}` : acc._result

        return {
            _result,
            _index
        }
    }, {
        _result: '',
        _index: requiredValues.length
    } as _internalType)

    return _result
}

