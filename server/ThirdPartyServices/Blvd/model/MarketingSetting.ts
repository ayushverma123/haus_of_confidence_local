import { ReminderType } from "./ReminderType"

export type MarketingSetting = {
    email: boolean,
    push: boolean,
    sms: boolean,
    type: ReminderType
}