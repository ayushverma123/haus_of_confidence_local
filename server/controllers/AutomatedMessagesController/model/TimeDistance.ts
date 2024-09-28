import { AutomatedMessageContactCriteriaAppointmentOptions } from "./AutomatedMessageContactCriteriaAppointmentOptions";
import { AutomatedMessageTimeConfigEntry, TimeUnit } from "./AutomatedMessageTimeConfigEntry";

export type TimeDistanceConfiguration = {
    distance: AutomatedMessageTimeConfigEntry,
    direction: TimeDistanceDirection,
    distanceFrom: TimeDistanceFrom,
    repeat?: boolean,
    repeatConfiguration?: AutomatedMessageTimeConfigEntry, // TODO -- So repeat every ___  days / hours / minutes / seconds from the config 
    endRepeat?: TimeDistanceConfigurationEndRepeatEntry, 
    timeInclusive?: boolean, //? If true, the time distance will include all times between the distance and the TimeDistanceFrom. If false, the time distance must be AT LEAST that value
    timeDistanceExclusiveTolerance?: TimeDistanceTolerance, // Duration to allow in either direction for time-exclusive (timeInclusive is false)
    // appointmentInclusionOptions?: AutomatedMessageContactCriteriaAppointmentOptions,
    specificDate?: AutomatedMessageTimeConfigEntry,
    excludeTimeUnits?: TimeUnit[] //! Will need extensive testing for dates
}

export type TimeDistanceConfigurationEndRepeatEntry = {
    direction: TimeDistanceDirection,
    endTime: AutomatedMessageTimeConfigEntry // TODO -- How many days / hours / minutes / seconds before / after the TimeDistanceFrom should we stop repeating?
}

export enum TimeDistanceDirection {
    Forward = "forward", // Example -- Forward 2 days
    Backward = "backward" // Example -- Backward 2 days
}

export enum TimeDistanceFrom {
    LastOpenAppointment = "lastOpenAppointment",
    LastCompletedAppointment = "lastCompletedAppointment",
    LastCancelledAppointment = "lastCancelledAppointment", // TODO -- Needs to only work if the cancelled appointment is the newest one
    NextAppointment = "nextAppointment",
    SpecificDate = 'specificDate',
    EarliestSameDayAppointment = 'earliestSameDayAppointment',
    Now = 'now'
    // LatestAppointment_CancelledAppointment = 'latestAppointment_cancelledAppointment', 
}

export type TimeDistanceTolerance = {[key in TimeDistanceDirection]: AutomatedMessageTimeConfigEntry}