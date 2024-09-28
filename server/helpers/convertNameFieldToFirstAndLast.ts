export const convertNameToFirstAndLast = (name: string | undefined) => {
    const emptyResult = ["",""]

    if (typeof(name) === 'undefined' || name === null) {
        return emptyResult
    }

    const splitName = name!.split(' ')

    if (splitName.length === 1) {
        return [splitName[0], ""]
    }

    return splitName.reduce((names: string[], currentName: string, index: number): string[] => {
        const isLast = index === splitName.length - 1

        return [
            (!isLast ? `${names[0] || ""} ${currentName}` : names[0]),
            currentName
        ]
    }, [])
}