import { BaseTokenRequest } from "./BaseTokenRequest"

export interface RefreshTokenRequest extends BaseTokenRequest {
    refresh_token: string
}