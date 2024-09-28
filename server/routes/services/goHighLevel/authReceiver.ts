import { getGHLAccessToken } from "../../../ThirdPartyServices/GoHighLevel/authentication/getAccessToken"
import { updateGHLAccessToken, updateGHLAuthToken, updateGHLLastRefresh, updateGHLRefreshToken } from "../../../ThirdPartyServices/GoHighLevel/stateManager"
import { asyncRoute } from "../../../helpers/AsyncRouteHelper"
import { respondWithError, respondWithStatusCode } from "../../../helpers/HTTPResponseHelper"
import { checkForRequiredParameters } from "../../../helpers/RouteHelper"
import { WebPathHelper } from "../../../helpers/WebPathHelper"

const routeRoot: string = "/services/gohighlevel/authReceiver"
const webpath: WebPathHelper = WebPathHelper(routeRoot)

export const routes = (app) => {
    //TODO
    app.get(webpath('/'), asyncRoute(async (req, res) => {
        const { code } = req.query

        console.log("GoHighLevel Access Code Received")
        console.log(req.query)

        if(!(await checkForRequiredParameters(res, [
            ["Authentication Code", code]
        ], true))) return

        try {
            await updateGHLAuthToken(code)
            // await updateGHLLastRefresh()

            // Get Access Token
            const { access_token, refresh_token } = await getGHLAccessToken()

            await updateGHLAccessToken(access_token)
            await updateGHLRefreshToken(refresh_token)
            await updateGHLLastRefresh()

            return respondWithStatusCode(res, 200)

        } catch (error) {
            console.error(`Unable to retrieve access token using auth code ${code}`)
            console.error(error)

            return respondWithStatusCode(res, 500)
        }
    }))
}