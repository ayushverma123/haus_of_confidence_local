import { ReminderType } from "./ReminderType"

export type ReminderSetting = {
    email: boolean,
    push: boolean,
    sms: boolean,
    type: ReminderType
}