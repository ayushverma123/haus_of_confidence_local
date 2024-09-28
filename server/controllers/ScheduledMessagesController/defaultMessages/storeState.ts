import { ScheduledMessageType } from "../model/ScheduledMessageType";

export type StoreState = {[key in ScheduledMessageType]: string[]}