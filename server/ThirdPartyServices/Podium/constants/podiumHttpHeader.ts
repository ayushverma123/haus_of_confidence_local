import { oAuthAuthenticationHeaderContents } from "../../../Authentication/OAuth2/authenticationHeader";
import { getPodiumAccessTokenValue } from "../stateManager";

export const podiumHttpHeader = async () => ({ 
    headers: oAuthAuthenticationHeaderContents((await getPodiumAccessTokenValue())!)
})
