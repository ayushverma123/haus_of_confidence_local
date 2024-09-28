import { utcToZonedTime } from "date-fns-tz";

export const getCurrentTimeWithTimezone = () => utcToZonedTime(new Date(), process.env.LOCAL_TIMEZONE!)