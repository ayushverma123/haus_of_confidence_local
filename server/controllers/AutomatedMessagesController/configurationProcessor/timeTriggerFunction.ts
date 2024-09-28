import { format } from "date-fns";
import { orReduction } from "../../../helpers/ArrayFunctions";
import { areDatesEqual, timeUnitToGetDateFunctionMap } from "../../../helpers/dateTimeFunctions";
import { AutomatedMessageTimeConfigEntry, TimeUnit } from "../model/AutomatedMessageTimeConfigEntry";
import { timeUnitKeys } from "../model/TimeUnitKeys";
import { convertAutomatedMessageTimeConfigEntryToDate } from "./helpers/convertAutomatedMessageTimeConfigEntryToDate";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { removeExcludedTimeUnits } from "./helpers/removeExcludedTimeUnits";
import { convertDateToAutomatedTimeConfigEntry } from "./helpers/convertDateToAutomatedTimeConfigEntry";

export const allTimeUnitsButHoursMinutes: TimeUnit[] = [ TimeUnit.Days, TimeUnit.Months, TimeUnit.Seconds, TimeUnit.Years, TimeUnit.Milliseconds ]

//! Each date needs to have all but hour and minutes set as excluded units
export const timeTriggerFunction = async (currentTime: Date, timeTriggers: AutomatedMessageTimeConfigEntry[]): Promise<boolean> => {
    // console.log("RUNNING TIME TRIGGER FUNCTION")
    // console.log("TIME TRIGGER ARRAY CONTENTS")
    // console.log(timeTriggers)
    try {
        // Turn current time into an AutomatedMessageTimeConfigEntry
        const adjustedCurrentTime: Date = await convertAutomatedMessageTimeConfigEntryToDate(convertDateToAutomatedTimeConfigEntry(currentTime), allTimeUnitsButHoursMinutes)
                // utcToZonedTime(
                    // await convertAutomatedMessageTimeConfigEntryToDate(convertDateToAutomatedTimeConfigEntry(currentTime)
                    // , allTimeUnitsButHoursMinutes),process.env.LOCAL_TIMEZONE!)
            

        //@ts-ignore
        // Convert each timeTrigger to date
        const adjustedTimeTriggers: Date[] = (await timeTriggers.reduce( async (acc: Promise<Date[]>, timeTrigger: AutomatedMessageTimeConfigEntry): Promise<Date[]> => {
            const existing = await acc
            
            try {
    
                const newDate: Date = await convertAutomatedMessageTimeConfigEntryToDate(timeTrigger, allTimeUnitsButHoursMinutes)

                return [
                ...existing,
                    newDate
                ]
            } catch (error) {
                console.error(`Could not convert timeTrigger ${timeTrigger} to date`)  
                console.error(error)
                return new Promise((_, reject) => reject(error))
            }
        }, [] as Date[]))
        //@ts-ignore
        // .filter(date => date)
            // removeExcludedTimeUnits(
            // utcToZonedTime(date, process.env.LOCAL_TIMEZONE!),
            //  allTimeUnitsButHoursMinutes) )


        
        // console.log("Adjusted Current Time: ", format(adjustedCurrentTime, "yyyy-MM-dd HH:mm:ss"))
        // Now check if the finalDate is equal to the current time with its excludedUnits set as well.\
        // Generate an array of booleans that stores the result of a comparison of the currentTime with the timeTrigger.
        const resultArray: boolean[] = adjustedTimeTriggers.reduce((acc: boolean[], timeTrigger: Date): boolean[] => {
            // console.log("TIME TRIGGER AFTER: ", timeTrigger)

            // console.log("Adjusted Target Time: ", format(timeTrigger, "yyyy-MM-dd HH:mm:ss"))

            // console.log("Time Trigger:", timeTrigger)
            // console.log("Current Time:", adjustedCurrentTime)

            return [ ...acc, areDatesEqual(adjustedCurrentTime, timeTrigger)]
        }, [])

        // Using an OR reduction, return true if any of the booleans are true.

        // console.log("TIME TRIGGER RESULT:", orReduction(resultArray))
        return new Promise<boolean>(resolve => resolve(orReduction(resultArray)))
    } catch (error) {
        console.error(`Error in timeTriggerFunction`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
