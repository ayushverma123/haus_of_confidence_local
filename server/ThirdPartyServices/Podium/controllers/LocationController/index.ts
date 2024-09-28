import { serviceEndpoint } from "../../../../constants/endpoints"
import { AxiosResponse } from "../../../../model/AxiosResponse"
import { EndpointType } from "../../../../model/EndpointType"
import { Maybe } from "../../../../model/Maybe"
import { ThirdPartyService } from "../../../../model/ThirdPartyService"
import { podiumHttpHeader } from "../../constants/podiumHttpHeader"
import { AddressDetails } from "../../model/AddressDetails"
import { ApiResponse } from "../../model/ApiResponse"
import { Location } from "../../model/Location"

const axios = require("axios")

const apiUrl = `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/locations`

export const getAddressDetailsFromLocationUid = async (locationUid: string): Promise<Maybe<AddressDetails>> => {
    const endpoint = `${apiUrl}/${locationUid}`

    // console.log(`Getting location from UID: ${locationUid}`)

    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<Location>> = await axios.get(endpoint, { ...await podiumHttpHeader() })

        if (status !== 200) throw new Error(statusText)

        const { addressDetails } = data.data

        return new Promise((resolve) => resolve(addressDetails))

    } catch (error) {
        console.error(`Could not get location from UID ${locationUid}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))

    }
}

export const getUSAddressStringFromLocationUid = async (locationUid: string): Promise<string> => {
    try {
        const addressDetails = await getAddressDetailsFromLocationUid(locationUid)

        if (typeof(addressDetails) === 'undefined') return ""

        const { city, houseNumber, road, state, postalCode } = addressDetails!
        const addressString = `${houseNumber} ${road}, ${city}, ${state} ${postalCode}`

        return new Promise((resolve) => resolve(addressString))

    } catch (error) {
        console.error(`Could not get address string from UID ${locationUid}`)
        return new Promise((_, reject) => reject(error))
    }
}

export const getLocationFromLocationUid = async (locationUid: string): Promise<Maybe<Location>> => {
    const endpoint = `${apiUrl}/${locationUid}`

    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<Location>> = await axios.get(endpoint, { ...await podiumHttpHeader() })

        if (status !== 200) throw new Error(statusText)


        return new Promise((resolve) => resolve(data.data))

    } catch (error) {
        console.error(`Could not get location from UID ${locationUid}`)
        console.error(error)

        return new Promise((resolve) => resolve(undefined))

    }
}