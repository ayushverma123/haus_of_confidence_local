export const isValueAnArray = (valueToCheck: any): boolean => {
    const type = typeof(valueToCheck)

    if (type !== 'object') {
        return false
    }

    return typeof(valueToCheck.length) === 'undefined' ?  false : true
}