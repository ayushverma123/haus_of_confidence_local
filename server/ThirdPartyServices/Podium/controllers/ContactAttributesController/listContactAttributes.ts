import { AxiosResponse } from "../../../../model/AxiosResponse"
import { podiumHttpHeader } from "../../constants/podiumHttpHeader"
import { ApiResponse } from "../../model/ApiResponse"
import { ContactAttribute } from "../../model/ContactAttribute"
import apiUrl from "./constant/apiUrl"

const axios = require("axios")

const listContactAttributes = async (): Promise<ContactAttribute[]> => {
    const endpoint = `${apiUrl}`

    try {
        const { data: { metadata, data }, status, statusText}: AxiosResponse<ApiResponse<ContactAttribute[]>> = await axios.get(endpoint, { 
            ...await podiumHttpHeader(),
        })

        if (status !== 200) {
            throw new Error(statusText)
        }

        return new Promise((resolve) => resolve(data))

    } catch (error) {
        console.error(`Unable to retrieve contact attributes from Podium`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export default listContactAttributes