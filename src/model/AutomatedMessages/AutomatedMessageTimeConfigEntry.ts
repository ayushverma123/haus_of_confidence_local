export type AutomatedMessageTimeConfigEntry = {
    years?: number,
    months?: number,
    // weeks?: number,
    days?: number,
    hour: number,
    minutes: number,
    seconds?: number,
    milliseconds?: number
}

export enum TimeUnit {
    Years = 'years',
    Months = 'months',
    // Weeks = 'weeks',
    Days = 'days',
    Hour = 'hour',
    Minutes = 'minutes',
    Seconds = 'seconds',
    Milliseconds ='milliseconds'
}