import { serviceEndpoint } from "../../../../constants/endpoints";
import { checkHTTPResponse } from "../../../../helpers/checkHTTPResponse";
import { AxiosResponse } from "../../../../model/AxiosResponse";
import { Maybe } from "../../../../model/Maybe";
import { authenticationHeader } from "../../authentication/authenticationHeader";
import { ApiResponse } from "../../model/ApiResponse";
import { Opportunity } from "../../model/Opportunity";

const axios = require("axios")

export const getOpportunityWithId = async (id: string): Promise<Maybe<Opportunity>> => {
    try {
        const { data, status, statusText }: AxiosResponse<ApiResponse<Opportunity>> = await axios.get(`${serviceEndpoint}/${id}`, {
           ...await authenticationHeader(),
        })

        checkHTTPResponse(status, statusText)

        const opportunity = data["opportunity"]

        return new Promise((resolve) => resolve(opportunity))


    } catch (error) {
        console.error(`Could not get remote GHL opportunity with ID: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}