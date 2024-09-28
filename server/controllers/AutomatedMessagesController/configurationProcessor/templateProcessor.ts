//? The Template Processor needs to take an AutomatedMessageTemplateType value, a GeneralContactId, and optionally an appointment ID and / or a string if the type is custom
//? and replace the template text in the string with the corresponding values

import { formatInTimeZoneWithOptions } from "date-fns-tz/fp";
import { StateProperties as BlvdStateProperties, getValue as getBlvdStateValue } from "../../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import { Location } from "../../../ThirdPartyServices/Blvd/model/Location";
import { Staff } from "../../../ThirdPartyServices/Blvd/model/Staff";
import { andReduction, orReduction } from "../../../helpers/ArrayFunctions";
import { MatchTuple, generateStringFromTemplate } from "../../../helpers/TextReplacementHelper";
import { Maybe } from "../../../model/Maybe";
import { ThirdPartyService } from "../../../model/ThirdPartyService";
import { AutomatedMessageDataObject } from "../model/AutomatedMessageDataObject";
import { AutomatedMessageTemplateType } from "../model/AutomatedMessageTemplateType";
import { getRandomMessageTemplateForMessageType } from "../templatesStateManager";
import { generateDataObject } from "./dataObjectGenerator";
import { 
    format, 
    parseISO,
    intervalToDuration, 
    Duration,
    formatDuration
} from 'date-fns'

import { formatInTimeZone } from "date-fns-tz"

const dayOfMonthFormat = 'do'

const longDayFormat: string = 'EEEE'
const shortDayFormat: string = 'EEE'

const longYearFormat: string = 'y'
const shortYearFormat: string = 'yy'

const longMonthFormat: string = 'MMMM'
const shortMonthFormat: string = 'MMM'

const _minutesFormat: string = 'mm'

const _12HourTimeFormat: string = 'h:mm aaa'
const _12HourTimeFormatNoMinutes: string = 'ha'
const shortDatetimeFormat: string = `MM/dd/yyyy ${_12HourTimeFormat}`
const shortDateFormat: string = 'MM/dd/yyyy'
const shortDateFormatNoYear: string = 'MM/dd'

const longDateFormat = (includeYear: boolean = false, includeDayName: boolean = false) => `${includeDayName ? `${dayOfMonthFormat}, ` : ''}${longMonthFormat} ${dayOfMonthFormat}${includeYear ? `, ${longYearFormat}` : ''}`

const filterOutUndefined = item => typeof(item) !== 'undefined'

const timezone = process.env.LOCAL_TIMEZONE!

// TODO - TEST
export const generateMessageStringFromTemplateType = async (templateType: AutomatedMessageTemplateType, dataObject: AutomatedMessageDataObject, templateString?: string): Promise<string> => {
    const isCustomTemplate = templateType === AutomatedMessageTemplateType.Custom
    // const hasAppointment = typeof(appointmentId) !== 'undefined'
    const hasTemplateString = typeof(templateString) !== 'undefined'

    //? Check for proper values
    if (isCustomTemplate && !hasTemplateString) {
        throw new Error("The templateString parameter must be defined if templateType is AutomatedMessageTemplateType.Custom")
    }    

    try {
        // Pull data for appropriate stuff (contact, appointment, etc.)
        // Compile the above into a dataObject

        // const dataObject: AutomatedMessageDataObject = await generateDataObject(appointmentId, `${contactId}`)
        const { appointment: hasAppointmentData, contact: hasContactData } = dataObject.hasData
        const { appointment: appointmentData, contact: contactData, numberOfAppointments, timeAsCustomer, birthdate } = dataObject.data

        const hasBirthdate = typeof(birthdate) !== 'undefined' && !Object.is(birthdate, null)

        // console.log("APPOINTMENT OBJECT")
        // console.log(appointmentData)

        if (hasAppointmentData && typeof(appointmentData) === 'undefined') {
            throw new Error("The appointmentData parameter must be defined if hasAppointmentData is true")
        }

        if (hasContactData && typeof(contactData) === 'undefined') {
            throw new Error("The contactData parameter must be defined if hasContactData is true")
        }

        const originalService: Maybe<ThirdPartyService> = hasContactData ? contactData!.original_service : undefined

        const contactTextReplacements: MatchTuple[] = !hasContactData ? [] : [
            // First Name
            // typeof(contactData!.first_name) !== 'undefined' ? ['{firstname}', contactData!.first_name] : undefined,
            ['{firstname}', contactData!.first_name ?? '' ],

            // Last Name
            // typeof(contactData!.last_name) !== 'undefined'? ['{lastname}', contactData!.last_name] : undefined,
            ['{lastname}', contactData!.last_name ?? ''],

            // Email
            (() => {
                const noEmail = ['{email}', '']
                const emails: string[] = contactData!.emails

                if (typeof(contactData!.emails) === 'undefined') return noEmail
                if (emails.length <= 0) return noEmail

                const email = emails[0]
                if (typeof(email) === 'undefined') return noEmail

                return ['{email}', email]
            })(),

            // Phone Number
            (() => {
                const noPhoneNumber = ['{phonenumber}', '']

                const phoneNumbers: string[] = contactData!.phone_numbers
                if (typeof(phoneNumbers) === 'undefined') return noPhoneNumber
                if (phoneNumbers.length <= 0) return noPhoneNumber

                const phoneNumber = phoneNumbers[0]
                if (typeof(phoneNumber) === 'undefined') return noPhoneNumber

                return ['{phonenumber}', phoneNumber]
            })(),

            // Number of Appointments
            (() => {
                // if (typeof(numberOfAppointments) === 'undefined') return undefined
                return ['{numberofappointments}', numberOfAppointments ?? '']
            })(),

            // Time as Customer
            (() => {
                if (typeof(timeAsCustomer) === 'undefined') return ['{timeascustomer}', '']
                
                const timeAsCustomerString = formatDuration(timeAsCustomer as Duration)

                return ['{timeascustomer}', timeAsCustomerString]
            })(),

            // Birthdate
            ...((): MatchTuple[] => {
                if (!hasBirthdate) return [
                    ['{birthday}', ''],
                    ['{birthday_withyear}', ''],
                    ['{birthday_long}', ''],
                    ['{birthday_long_withyear}', ''],
                    ['{birthday_long_withdayname}', ''],
                    ['{birthday_long_withyear_withdayname}', ''],
                ]

                return [
                    ['{birthday}', format(birthdate, shortDateFormatNoYear)],
                    ['{birthday_withyear}', format(birthdate, shortDateFormat)],
                    ['{birthday_long}', format(birthdate, longDateFormat(false, false))],
                    ['{birthday_long_withyear}', format(birthdate, longDateFormat(true, false))],
                    ['{birthday_long_withdayname}',format(birthdate, longDateFormat(false, true))],
                    ['{birthday_long_withyear_withdayname}', format(birthdate, longDateFormat(true, true))],
                ]
            })()

        ].filter(filterOutUndefined) as MatchTuple[]

        const hasStartDate = hasAppointmentData && typeof(appointmentData!.startAt) !== 'undefined'
        const hasEndDate = hasAppointmentData && typeof(appointmentData!.endAt) !== 'undefined'

        const nowDate: Date = parseISO(new Date().toISOString())

        // const startDate: Maybe<Date> = hasStartDate ? parseISO(new Date(appointmentData!.startAt).toISOString()) : undefined
        // const endDate: Maybe<Date> = hasEndDate  ? parseISO(new Date(appointmentData!.endAt).toISOString()) : undefined

        const startDate: Maybe<Date> = hasStartDate ? parseISO(appointmentData!.startAt) : undefined
        const endDate: Maybe<Date> = hasEndDate  ? parseISO(appointmentData!.endAt) : undefined
        
        const supportsDurations = hasStartDate && hasEndDate

        const appointmentDuration: Maybe<Duration> = supportsDurations ? intervalToDuration({
            start: startDate!,
            end: endDate!
        }) : undefined

        const appointmentUpcomingDuration: Maybe<Duration> = supportsDurations ? intervalToDuration({
            start: nowDate,
            end: endDate!
        }) : undefined

        const hasAppointmentDuration: boolean = typeof(appointmentDuration) !== 'undefined'
        const hasAppointmentUpcomingDuration: boolean = typeof(appointmentUpcomingDuration) !== 'undefined'

        const hasAppointmentServices: boolean = (() => {
            if (!hasAppointmentData) return false
            if( typeof(appointmentData!.appointmentServices) === 'undefined' ) return false
            if (appointmentData!.appointmentServices.length <= 0) return false
            return true
        })() 

        console.log("hasAppointmentServices?", hasAppointmentServices)
        console.log("APPOINTMENT SERVICES") 
        console.log(appointmentData?.appointmentServices)

        const hasStaff = (() => {
            if (!hasAppointmentData || !hasAppointmentServices) return false
            if (typeof(appointmentData) === 'undefined') return false
            if (typeof(appointmentData!.appointmentServices) === 'undefined') return false
            if (appointmentData!.appointmentServices.length <= 0) return false

            const resultArray: boolean[] = appointmentData!.appointmentServices!.map(appointmentService => typeof(appointmentService.staff) !== 'undefined')

            if (!orReduction(resultArray)) return false
            return true
        })()
        
        const firstStaffMember: Maybe<Staff> =  hasStaff ? appointmentData!.appointmentServices![0].staff : undefined

        const includeMinutesInTime = (date: Date) => formatInTimeZone(date!, timezone, _minutesFormat) !== '00'

        const appointmentTextReplacements: MatchTuple[] = !hasAppointmentData ? [] : [
            //TODO - TEST - Appointment Start Date and Time - FORMAT THEM
            ...(hasStartDate ? [
                ['{appointment_startdate_short}', formatInTimeZone(startDate!, timezone, shortDateFormat)],
                ['{appointment_starttime}', formatInTimeZone(startDate!, timezone, includeMinutesInTime(startDate!) ? _12HourTimeFormat : _12HourTimeFormatNoMinutes)],
                ['{appointment_day_long}', formatInTimeZone(startDate!, timezone, longDayFormat)],
                ['{appointment_day_short}', formatInTimeZone(startDate!, timezone, shortDayFormat)],
                ['{appointment_day_of_month}', formatInTimeZone(startDate!, timezone, dayOfMonthFormat)],
                ['{appointment_month_long}', formatInTimeZone(startDate!, timezone, longMonthFormat)],
                ['{appointment_month_short}', formatInTimeZone(startDate!, timezone, shortMonthFormat)],
                ['{appointment_year_long}', formatInTimeZone(startDate!, timezone, longYearFormat )],
                ['{appointment_year_short}', formatInTimeZone(startDate!, timezone, shortYearFormat )],
                // ['{appointment_startdate_short}', format(startDate!, shortDateFormat)],
                // ['{appointment_starttime}', format(startDate!, _12HourTimeFormat)],
                // ['{appointment_day_long}', format(startDate!, longDayFormat)],
                // ['{appointment_day_short}', format(startDate!, shortDayFormat)],
                // ['{appointment_day_of_month}', format(startDate!, dayOfMonthFormat)],
                // ['{appointment_month_long}', format(startDate!, longMonthFormat)],
                // ['{appointment_month_short}', format(startDate!, shortMonthFormat)],
                // ['{appointment_year_long}', format(startDate!, longYearFormat )],
                // ['{appointment_year_short}', format(startDate!,  shortYearFormat )],
            ] : [
                ['{appointment_startdate_short}', ''],
                ['{appointment_starttime}', ''],
                ['{appointment_day_long}', ''],
                ['{appointment_day_short}', ''],
                ['{appointment_day_of_month}', ''],
                ['{appointment_month_long}', ''],
                ['{appointment_month_short}', ''],
                ['{appointment_year_long}', ''],
                ['{appointment_year_short}', '']
            ]),

            //TODO - TEST - Appointment End Date and Time - FORMAT THEM
            ...(hasEndDate ? [
                // ['{appointment_enddate_short}', format(endDate!, shortDateFormat)],
                // ['{appointment_endtime}', format(endDate!, _12HourTimeFormat)],
                ['{appointment_enddate_short}', formatInTimeZone(endDate!, timezone, shortDateFormat)],
                ['{appointment_endtime}', formatInTimeZone(endDate!, timezone, includeMinutesInTime(endDate!) ? _12HourTimeFormat : _12HourTimeFormatNoMinutes)],
            ] : [
                ['{appointment_enddate_short}',''],
                ['{appointment_endtime}', '']
            ]),

            // TODO - TEST - Appointment Duration
            // (typeof(appointmentData!.duration) !== 'undefined'? [ '{appointment_duration}', appointmentData!.duration ] : [undefined]),
            ...(hasAppointmentDuration ? [
                ['{appointment_duration_hours}', `${appointmentDuration!.hours}`],
                ['{appointment_duration_minutes}', `${appointmentDuration!.minutes}`],
                ['{appointment_duration_seconds}', `${appointmentDuration!.seconds}`],
             ] : [
                ['{appointment_duration_hours}', ''],
                ['{appointment_duration_minutes}', ''],
                ['{appointment_duration_seconds}', '']
              ]),

             //TODO - TEST - Appointment Upcoming Duration
             ...(hasAppointmentUpcomingDuration ? [
                ['{appointment_upcoming_duration_months}', `${appointmentUpcomingDuration!.months!}`],
                ['{appointment_upcoming_duration_weeks}', `${appointmentUpcomingDuration!.weeks!}`],
                ['{appointment_upcoming_duration_days}', `${appointmentUpcomingDuration!.days!}`],
                ['{appointment_upcoming_duration_hours}', `${appointmentUpcomingDuration!.hours}`],
                ['{appointment_upcoming_duration_minutes}', `${appointmentUpcomingDuration!.minutes}`],
                ['{appointment_upcoming_duration_seconds}', `${appointmentUpcomingDuration!.seconds}`],
             ] : [
                ['{appointment_upcoming_duration_months}', ''],
                ['{appointment_upcoming_duration_weeks}', ''],
                ['{appointment_upcoming_duration_days}', ''],
                ['{appointment_upcoming_duration_hours}', ''],
                ['{appointment_upcoming_duration_minutes}', ''],
                ['{appointment_upcoming_duration_seconds}', '']
             ]),

             // TODO -- TEST -- Appointment Services
             ...(hasAppointmentServices ? [
                ['{appointment_services}', (() => {
                    type _NameAndDescription = [string, string]

                    const serviceNamesAndDescriptions: _NameAndDescription[] = appointmentData!.appointmentServices
                        .map(item => [item.service.name, item.service.description || ''])

                    //@ts-ignore
                    return serviceNamesAndDescriptions.reduce((acc: string, serviceInfo: _NameAndDescription, index, array) => 
                        `${acc}${index > 0 ? ', ' : ''}${serviceInfo[0]}`
                    , '') 
                })()]
             ] : [
                ['{appointment_services}', '']
             ]),

            ...(hasStaff ? [
                ['{appointment_service_staff_firstname}', `${firstStaffMember!.firstName}`],
                ['{appointment_service_staff_lastname}', `${firstStaffMember!.lastName}`],
                // ['{appointment_service_staff_email}', `${firstStaffMember!.email}`],
                // ['{appointment_service_staff_mobile}', `${firstStaffMember!.mobilePhone}`],
                ['{appointment_service_staff_role}', `${firstStaffMember!.role}`],
             ] : [
                ['{appointment_service_staff_firstname}', ''],
                ['{appointment_service_staff_lastname}', ''],
                // ['{appointment_service_staff_email}', ''],
                // ['{appointment_service_staff_mobile}', ''],
                ['{appointment_service_staff_role}', '']
             ]),

        ].filter(filterOutUndefined) as MatchTuple[]

        const currentDatetime: Date = new Date(dataObject.currentTime.toString()) // TODO - TEST VALUE IS CORRECT
        const locationData: Maybe<Location> = await getBlvdStateValue<Location>(BlvdStateProperties.location)

        const hasLocationData = typeof(locationData) !== 'undefined'

        const address = hasLocationData ? locationData!.address : undefined
        const hasAddress = typeof(address) !== 'undefined'

        const line1 = hasAddress ? address!.line1 : undefined
        const hasLine1 = typeof(line1) !== 'undefined'

        const line2 = hasAddress ? address!.line2 : undefined
        const hasLine2 = typeof(line2) !== 'undefined'

        const city = hasAddress ? address!.city : undefined
        const hasCity = typeof(city) !== 'undefined'

        const state = hasAddress ? address!.state : undefined
        const hasState = typeof(state) !== 'undefined'

        const province = hasAddress ? address!.province : undefined
        const hasProvince = typeof(province) !== 'undefined'

        const zipcode = hasAddress ? address!.zip : undefined
        const hasZipcode = typeof(zipcode) !== 'undefined'

        const hasFullAddress = hasLine1 && hasCity && (hasState || hasProvince) && hasZipcode
        const fullAddress = hasFullAddress ? `${line1 ?? ''}, ${city ?? ''}, ${typeof(state) !== 'undefined' ? `${state}` : typeof(province) !== 'undefined' ? `${province}` : ''} ${zipcode ?? ''}` : undefined

        const businessName = hasLocationData ? locationData!.businessName : undefined
        const hasBusinessName = typeof(businessName) !== 'undefined'

        const businessEmail = hasLocationData ? locationData!.contactEmail : undefined
        const hasBusinessEmail = typeof(businessEmail) !== 'undefined'

        const businessWebsite = hasLocationData ? locationData!.website : undefined
        const hasBusinessWebsite = typeof(businessWebsite) !== 'undefined'

        const locationReplacements: MatchTuple[] = !hasLocationData ? [] : [
            ...(hasAddress ? [ 
                ['{location_address_line1}', hasLine1 ? line1 : ''],
                ['{location_address_line2}', hasLine2 ? line2 : ''],
                [`{location_address_zip}`, hasZipcode ? zipcode : ''],
                ['{location_address_city}', hasCity ? city : ''],
                ['{location_address_state}', hasState ? state : ''],
                ['{location_address_province}', hasProvince ? province : ''],
                ['{location_formatted_address}', hasFullAddress ? fullAddress : '']
            ] : [
                ['{location_address_line1}', ''],
                ['{location_address_line2}', ''],
                [`{location_address_zip}`, ''],
                ['{location_address_city}', ''],
                ['{location_address_state}', ''],
                ['{location_address_province}', ''],
                ['{location_formatted_address}', '']
            ]),
            ['{location_business_email}', hasBusinessEmail ? businessEmail : ''],
            ['{location_business_name}', hasBusinessName ? businessName : ''],
            ['{location_business_website}', hasBusinessWebsite ? businessWebsite : ''],
        ].filter(filterOutUndefined) as MatchTuple[]


        const timeReplacements: MatchTuple[] = [
            ['{datetime_current}',  formatInTimeZone(currentDatetime, timezone, shortDatetimeFormat)],
            ['{date_current}',  formatInTimeZone(currentDatetime, timezone, shortDateFormat)],
            ['{time_current}', formatInTimeZone(currentDatetime, timezone, _12HourTimeFormat)],
            ['{day_current_long}', formatInTimeZone(currentDatetime, timezone, longDayFormat)],
            ['{day_current_short}', formatInTimeZone(currentDatetime, timezone, shortDayFormat)],
            ['{month_current_long}', formatInTimeZone(currentDatetime, timezone, longMonthFormat)],
            ['{month_current_short}', formatInTimeZone(currentDatetime, timezone, shortMonthFormat)],
            ['{year_current_long}', formatInTimeZone(currentDatetime, timezone, longYearFormat )],
            ['{year_current_short}', formatInTimeZone(currentDatetime, timezone, shortYearFormat )],
        ]

        const textReplacements: MatchTuple[] = [
            //@ts-ignore
            ...(hasContactData ? contactTextReplacements : []),
            //@ts-ignore
            ...(hasAppointmentData ? appointmentTextReplacements : []),
            //@ts-ignore
            ...(hasLocationData ? locationReplacements : []),

            ...timeReplacements
        ]

        const _templateString: Maybe<string> = hasTemplateString ? templateString : await getRandomMessageTemplateForMessageType(templateType)

        if (typeof(_templateString) === 'undefined') {
            throw new Error(`Could not find a message template for template type: ${templateType}`)
        }

        const newString = generateStringFromTemplate(_templateString, textReplacements)

        return newString

    } catch (error) {
        console.error(`Could not generate a message string from template type: ${templateType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}