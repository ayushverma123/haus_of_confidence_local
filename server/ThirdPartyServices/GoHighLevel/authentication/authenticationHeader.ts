import { getGHLAuthToken } from "../stateManager";

export const authenticationHeader = async () => ({ 
    headers:{
        Authorization: await getGHLAuthToken() ?? '',
        Version: '2021-07-28', 
        Accept: 'application/json'
    }
})