import { formatInTimeZone, utcToZonedTime } from "date-fns-tz"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"
import { format } from "date-fns-tz"

export const requestCallString = 'REQUEST_serverTimezone'
export const responseCallString = 'RESPONSE_serverTimezone'

type _inputType = {
    formatted: boolean,
    timeZoneFormat: string
}

export const getServerTimezone: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,
    socketFunction: async (options: string) => {
        const { formatted: _formatted, timeZoneFormat: _timeZoneFormat }: _inputType = JSON.parse(options)

        const formatted = _formatted ?? false
        const timeZoneFormat = _timeZoneFormat ?? 'zzz'

        const timeZone: string = process.env.LOCAL_TIMEZONE!

        const result = !formatted 
            ? timeZone 
            : formatInTimeZone(
                utcToZonedTime(new Date(), timeZone), 
                timeZone,
                timeZoneFormat
            )

        return result
    }
}