import { randomRange } from "./RandomNumberGenerator";

export const generateRandomString = (length: number) => {
    /*
    (Total number of characters available minus _ and - for first character)
    - (total number of characters available)^(string length - 1)
    */
    // const totalPossibleCharacters= 62
    // const totalPossible = Math.pow(totalPossibleCharacters, length)

    //Generates the actual string
    /*
        CHARACTER CODES:
        65 - 90 : Uppercase
        97 - 122: lowercase
    */
    return Array.from(Array(length).keys()).reduce((fullString: string): string => {
        const nextCharacter: string | number = (() => {
            switch (randomRange(0,3)) {
                case 0:
                    //uppercase
                    return String.fromCharCode(randomRange(65,90))
                case 1:
                    //lowercase
                    return String.fromCharCode(randomRange(97,122))
                case 2:
                    //number
                    return randomRange(0,9)
                default:
                    return 0
            }
        })()
        
        return `${fullString}${nextCharacter}`

    }, "")
}