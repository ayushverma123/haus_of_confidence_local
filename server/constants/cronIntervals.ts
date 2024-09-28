export const everyHour = '0 0 * * * *';
export const everyMinute = '0 * * * * *';
export const everyTenSeconds = '0-59/10 * * * * *'
export const everyThirtySeconds = '0-59/30 * * * * *'
export const everyTenMinutes = '0 0-59/10 * * * *'
export const everyNMinutes = (minutes: number) => `0 0-59/${minutes} * * * *`
export const everyNSeconds = (seconds: number) => `0-59/${seconds} * * * * *`
export const onNSecondsEveryMinute = (nSeconds: number) => `${nSeconds} * * * * *`
export const onNSecondsEveryNMinutes = (seconds: number, minutes: number) => `${seconds} 0-59/${minutes} * * * *`
export const onNSecondsEveryNMinutePerHour = (seconds: number, minute: number) => `${seconds} ${minute} * * * *`
export const oncePerDayAtHoursMinutesSeconds = (hours: number, minutes: number, seconds: number) => `${hours} ${minutes} ${seconds} * * *`
