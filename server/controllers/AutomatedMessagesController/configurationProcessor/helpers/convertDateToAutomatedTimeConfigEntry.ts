import { timeUnitToGetDateFunctionMap } from "../../../../helpers/dateTimeFunctions"
import { AutomatedMessageTimeConfigEntry } from "../../model/AutomatedMessageTimeConfigEntry"
import { timeUnitKeys } from "../../model/TimeUnitKeys"

export const convertDateToAutomatedTimeConfigEntry = (date: Date): AutomatedMessageTimeConfigEntry => {
    // Using the timeUnitKeys array, create an object that contains the values for each of the timeUnits.
    //@ts-ignore
    const data: AutomatedMessageTimeConfigEntry = timeUnitKeys.reduce((acc: AutomatedMessageTimeConfigEntry, key: string): AutomatedMessageTimeConfigEntry => ({
      ...acc,
        [key]: timeUnitToGetDateFunctionMap[key](date)
    }), {})

    return data
}