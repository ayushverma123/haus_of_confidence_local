import { GoHighLevelOAuthScopes } from "../ThirdPartyServices/GoHighLevel/authentication/model/GoHighLevelOAuthScopes"
import { PodiumOAuthScope } from "../ThirdPartyServices/Podium/model/OAuthScope"

export type ValidOAuthScopeTypes = PodiumOAuthScope | GoHighLevelOAuthScopes

export const encodeOAuthScopes = <T extends ValidOAuthScopeTypes,>(scopes: T[], encodeSpace: boolean = true) => scopes.reduce((finalString: string, currentScope: T, index: number): string => {
    const isFirst: boolean = index === 0
    const space: string = encodeSpace ? "%20" : " " 

    return `${finalString}${isFirst ? "" : space}${currentScope}`
}, "")

