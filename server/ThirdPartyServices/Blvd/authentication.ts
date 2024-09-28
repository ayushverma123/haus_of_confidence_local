import { serviceEndpoint } from "../../constants/endpoints"
import { EndpointType } from "../../model/EndpointType"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { Base64 } from "js-base64";

const crypto = require("crypto");

const adminApiUrl = serviceEndpoint[ThirdPartyService.Boulevard][EndpointType.AdminAPI]

export const generateAuthenticationString =  (): string => {

    const prefix: string = "blvd-admin-v1"

    const timestamp = Math.floor(Date.now() / 1000)
    const tokenPayload: string = `${prefix}${process.env.BLVD_BUSINESS_ID!}${timestamp}`


    try {
        const httpBasicCredentials: string = (() => {
            // try {
            //     // const rawKey: string = Base64.decode(process.env.BLVD_SECRET_KEY!)
            //     const rawKey: string = process.env.BLVD_SECRET_KEY!
            //     const rawMac: string = createHmac('sha256', rawKey).update(tokenPayload).digest('hex')

            //     const signature = Base64.encode(rawMac)
            //     const token = `${signature}${tokenPayload}`
    
            //     const httpBasicPayload = `${process.env.BLVD_API_KEY}:${token}`
            //     const _httpBasicCredentials = Base64.encode(httpBasicPayload)

            //     return _httpBasicCredentials
            // } catch (error) {
            //     console.error("ERROR: Could not generate Boulevard authentication credentials")
            //     console.error(error)
    
            //     throw error
            // }
            // const timestamp = Math.floor(Date.now() / 1000)
          
            const payload = tokenPayload // `${prefix}${business_id}${timestamp}`
            const raw_key = Buffer.from(process.env.BLVD_SECRET_KEY!, 'base64')
            const signature = crypto
              .createHmac('sha256', raw_key)
              .update(payload, 'utf8')
              .digest('base64')
          
            const token = `${signature}${payload}`
            const http_basic_payload = `${process.env.BLVD_API_KEY}:${token}`
            const http_basic_credentials = Buffer.from(http_basic_payload, 'utf8').toString('base64')
          
            return http_basic_credentials
        })()
        
        // const httpBasicHeader = `Authorization: Basic ${httpBasicCredentials}`
        const authorizationString = `Basic ${httpBasicCredentials}`

        // console.log("================================ AUTH STRING =================================")
        // console.log(authorizationString)

        return authorizationString
    
    } catch (error) {
        throw error
    }

}
