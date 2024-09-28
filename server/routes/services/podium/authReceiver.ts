import { asyncRoute } from "../../../helpers/AsyncRouteHelper";
import { respondWithStatusCode } from "../../../helpers/HTTPResponseHelper";
import { checkForRequiredParameters } from "../../../helpers/RouteHelper";
import { WebPathHelper } from "../../../helpers/WebPathHelper";
import { redeemAuthorizationCodeForAccessToken } from "../../../ThirdPartyServices/Podium/authentication";
import { getLocationFromLocationUid } from "../../../ThirdPartyServices/Podium/controllers/LocationController";

const routeRoot: string = "/services/podium/authReceiver"
const webpath: WebPathHelper = WebPathHelper(routeRoot)

import { getPodiumOauthStateValue, updatePodiumAccessTokenValue, updatePodiumAuthTokenValue, updatePodiumLastRefreshValue, updatePodiumOrganizationIdValue, updatePodiumRefreshToken } from "../../../ThirdPartyServices/Podium/stateManager"

export const routes = (app) => {

    // TODO
    app.get(webpath('/'), asyncRoute(async (req, res, next) => {
        const { code, state } = req.query

        //  • Check that returned state is equal to state stored in authCache
        //  • If equal, store code as Podium auth code
       if(!(await checkForRequiredParameters(res, [
            ["Authentication code", code],
            ["Podium state value", state]
        ], true))) return

        try {
            const localStateValue: string = await getPodiumOauthStateValue()

            if (localStateValue !== state) {
                console.log("Remote and local Podium state values do not match")
                return respondWithStatusCode(res, 400)
            }

            await updatePodiumAuthTokenValue(code)

            // Now Redeem authorization code for access token
            const { access_token, refresh_token } = await redeemAuthorizationCodeForAccessToken(code)

            // Store values and update last refresh timestamp
            await updatePodiumAccessTokenValue(access_token)
            await updatePodiumRefreshToken(refresh_token)
            await updatePodiumLastRefreshValue()

            await updatePodiumOrganizationIdValue((await getLocationFromLocationUid(process.env.PODIUM_LOCATION_ID!))!.organizationUid)

            return respondWithStatusCode(res, 200)
            
        } catch (error) {
            console.error("ERROR: Could not receive Podium authorization code")
            console.error(error)

            return respondWithStatusCode(res, 500)
        } 
    }))
}