export const stringifyError = (error: Error): string => JSON.stringify({
    message: error.message,
    stack: error.stack,
    name: error.name,
    type: error.name
})