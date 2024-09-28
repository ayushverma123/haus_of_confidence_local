import { AccessTokenResponse } from "../../../../Authentication/OAuth2/model/AccessTokenResponse";

export interface GHLAccessTokenResponse extends AccessTokenResponse {
    token_type: string,
    expires_in: number,
    scope: string,
    userType: string,
    locationId: string,
    companyId: string,
    approvedLocations: Array<string>,
    hashedCompanyId: string
}

