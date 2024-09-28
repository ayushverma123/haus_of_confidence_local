import { checkEnvBooleanValue } from "../../../helpers/envFunctions";

export const isSandbox: boolean = checkEnvBooleanValue(process.env.GHL_SANDBOX)
