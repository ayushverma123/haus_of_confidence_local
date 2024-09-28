import { AxiosResponse } from "../model/AxiosResponse";

export const GenericAxiosError = (response: AxiosResponse) => new Error(`HTTP ${response.status}: ${response.statusText}`)