import { checkHTTPResponse } from "../../../../helpers/checkHTTPResponse";
import { AxiosResponse } from "../../../../model/AxiosResponse";
import { Maybe } from "../../../../model/Maybe";
import { authenticationHeader } from "../../authentication/authenticationHeader";
import { ApiResponse } from "../../model/ApiResponse";
import { Contact } from "../../model/Contact";
import { getGHLAuthToken } from "../../stateManager";
import endpoint from "./constants/endpoint";

const axios = require("axios")

export const getContactWithId = async (id: string): Promise<Maybe<Contact>> => {
    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<Contact>> = await axios.get(`${endpoint}/${id}`, {
            ...await authenticationHeader(),
        })

        checkHTTPResponse(status, statusText)

        const contact = data["contact"]

        return new Promise((resolve) => resolve(contact))

    } catch (error) {
        console.error(`Could not get remote GHL contact with ID: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}