import { checkEnvBooleanValue } from "../helpers/envFunctions";

require('dotenv').config()
const cron = require('node-cron');

//@ts-ignore
const verbose: boolean = checkEnvBooleanValue(process.env.VERBOSE)

export const announceToConsole = (cronTitle, text) => { 
    if (verbose) {
        console.log(`[${new Date().toLocaleString()}]:[${cronTitle}]: ${text}`)
    }
}


export const skippingTaskPrefix = "--{ Skipping }--"


export const CronTask = (cronString, cronTitle, taskFunction) => {
    const announceRun = () => announceToConsole(cronTitle, `Running Scheduled Task`)

    return {
        activate: () => cron.schedule(cronString, () => { 
            announceRun()
            taskFunction()
        }),
        withErrorHandler: (errorFunction) => ({
            activate: () => cron.schedule(cronString, () => {
                try {
                    announceRun()
                    taskFunction()
                } catch (error) {
                    errorFunction(error)
                }
            })
        })
    }
}


