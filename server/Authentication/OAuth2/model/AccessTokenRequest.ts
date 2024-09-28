import { BaseTokenRequest } from "./BaseTokenRequest";

export interface AccessTokenRequest extends BaseTokenRequest {
    code: string
}