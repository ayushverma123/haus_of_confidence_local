import { ScheduledMessageType } from "./ScheduledMessageType";

export type ScheduledMessageMap <T,> = {[key in ScheduledMessageType]: T}