import { missingConfigMessage } from "../resources/strings"

export const hasRequiredEnvironmentVariables = (useTls: boolean): boolean => {
    const requiredEnv = [
        "PORT",
        "BLVD_API_KEY",
        // "BLVD_APP_KEY",
        "BLVD_SECRET_KEY",
        "BLVD_BUSINESS_ID",
        "PODIUM_CLIENT_ID",
        "PODIUM_CLIENT_SECRET",
        "PODIUM_REDIRECT_URI",
        // "PODIUM_ORGANIZATION_ID",
        "PODIUM_LOCATION_ID",
        "FRONTEND_PASSCODE",
        "GHL_CLIENT_ID",
        "GHL_CLIENT_SECRET",
        "GHL_REDIRECT_URI",
        "DATABASE_URL",
        "BASE_URL",
        "LOCAL_TIMEZONE"
        // "BLVD_LOCATION_ID"
    ]

    const requiredTlsEnv = [
        "HTTPS_PORT",
        "KEY_FILE",
        "CERT_FILE"
    ]

    const requiredAll = useTls ? [...requiredEnv, ...requiredTlsEnv] : requiredEnv

    const envCheck: {[key: string]: boolean} = requiredAll.reduce((acc, cv) => (
        {
            ...acc,
            [cv]: typeof(process.env[cv]) !== "undefined" && process.env[cv] !== ""
        }
    ), {})

    const failedItems = Object.keys(envCheck).filter((item: string) => !envCheck[item])

    const missingRequiredSettings = failedItems.length > 0

    if (missingRequiredSettings) {
        console.group(missingConfigMessage)
            failedItems.forEach((item: string) => console.log(item))
        console.groupEnd()

        return false
    }

    return true
}