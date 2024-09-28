const headerSpacer = "----------"
const itemSpacer = "---"
const tabSpace = "    "

export enum LogMessageType {
    "error",
    "info",
    "log"
}

// const formatLogMessage = (caller, message)

const logMessageTypeToConsoleFunctionMap: ReadonlyMap<LogMessageType, (arg0: String) => void> = new Map([
        [LogMessageType.error, (message) => console.error(message)],
        [LogMessageType.info, (message) => console.info(message)],
        [LogMessageType.log, (message) => console.log(message)] 
])

export const logToConsole = (type: LogMessageType, caller: String, message: String) => {
    const logFunction: (arg0: String) => void = logMessageTypeToConsoleFunctionMap.get(type)!
    logFunction(`${new Date().toISOString()} - ${caller} ${headerSpacer}`)
    logFunction(`${tabSpace} ${message}`)
    // logFunction(`${itemSpacer} ${message}`)
    // logFunction(`${headerSpacer}${headerSpacer}`)
}

export const queryFailureResponse = <T, >(moduleName, query, failureResponse: T): Promise<T> => {
    logToConsole(LogMessageType.error, moduleName, `Unable to complete query:`)
    logToConsole(LogMessageType.error, moduleName, query)
    return new Promise<T>((resolve) => resolve(failureResponse))
}

export const logGenericError = (moduleName, error) => 
    logToConsole(LogMessageType.error, moduleName, `Caught error: ${error}`)
