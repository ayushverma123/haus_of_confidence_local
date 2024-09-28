
export const capitalizeWord = (word: string): string => `${word[0].toUpperCase()}${word.slice(1)}`
export const stringEndsWithS = (testString: string): boolean => {
    const finalLetter = (testString[testString.length - 1]).toLowerCase()
    return finalLetter === "s"
}