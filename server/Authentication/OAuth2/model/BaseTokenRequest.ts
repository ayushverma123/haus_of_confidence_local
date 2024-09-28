import { GrantType } from "./GrantType";

export interface BaseTokenRequest {
    client_id: string,
    client_secret: string,
    grant_type: GrantType,
}