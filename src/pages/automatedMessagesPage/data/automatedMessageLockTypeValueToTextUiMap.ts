import { AutomatedMessageLockType } from "../../../model/AutomatedMessages/AutomatedMessageLockType";

export const automatedMessageLockTypeValueToTextUiMap: {[key in AutomatedMessageLockType]: string} = {
    [AutomatedMessageLockType.None]: "None",
    [AutomatedMessageLockType.DailyAppointment]: "Once Per Appointment Daily",
    [AutomatedMessageLockType.OncePerAppointment]: "Once Per Appointment",
    [AutomatedMessageLockType.OnceInLifetime]: "Once Per Contact",
    [AutomatedMessageLockType.OnceYearlyContact]: "Once Per Contact Yearly",
}