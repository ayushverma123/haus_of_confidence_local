export type MatchTuple = [string, string] // [0] is the template string, [1] is its replacement

export function generateStringFromTemplate(template: string, matchConfig: Array<MatchTuple>): string { 
    return matchConfig.reduce((templateString, currentMatch) => 
        templateString.replaceAll(currentMatch[0], currentMatch[1]), template)
}
//Example:
// const matchConfig = [["{food}", "tacos"]]