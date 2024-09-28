import { timeUnitToSetDateValue } from "../../../../helpers/dateTimeFunctions";
import { TimeUnit } from "../../model/AutomatedMessageTimeConfigEntry";

export const removeExcludedTimeUnits = (date: Date, excludeUnits: TimeUnit[] ) => 
    excludeUnits.reduce((acc: Date, key: TimeUnit): Date => timeUnitToSetDateValue[key](acc, 0), date)
