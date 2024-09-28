import { logToConsole, LogMessageType } from './ConsoleLogHelper'

export const endTask = (taskName: String) => {
    logToConsole(LogMessageType.log, taskName, `${taskName} has completed`)
}