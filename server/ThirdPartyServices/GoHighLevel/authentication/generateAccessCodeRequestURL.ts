import { encodeOAuthScopes } from "../../../helpers/encodeOAuthScopes"
import { scopesInUse } from "./config/scopesInUse"
import { GoHighLevelOAuthScopes } from "./model/GoHighLevelOAuthScopes"

export const generateGHLAccessCodeRequestURL = (): string => {
    const scopesString: string = encodeOAuthScopes<GoHighLevelOAuthScopes>(scopesInUse, true)
    const redirectURI: string = process.env.GHL_REDIRECT_URI! // TODO
    const clientID: string =  process.env.GHL_CLIENT_ID!

    return `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectURI}&client_id=${clientID.toUpperCase()}&scope=${scopesString}`

}
// https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=https://business-backend-054e5668457c.herokuapp.com/services/gohighlevel/authReceiver&client_id=65694a38b534c28ddad9626b-lpmrwocc&scope=businesses.readonly%20contacts.readonly%20locations.readonly%20opportunities.readonly%20opportunities.write%20oauth.readonly