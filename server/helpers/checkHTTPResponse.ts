export const checkHTTPResponse = (statusCode, statusText) => {
    if (statusCode !== 200) {
        throw new Error(statusText)
    }
}