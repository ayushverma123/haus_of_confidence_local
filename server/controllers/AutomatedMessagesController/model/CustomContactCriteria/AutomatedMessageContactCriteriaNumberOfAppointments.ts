import { AutomatedMessageContactCriteriaAppointmentOptions } from "../AutomatedMessageContactCriteriaAppointmentOptions";

export type AutomatedMessageContactCriteriaNumberOfAppointments = {
    // ? Default will be to get all appointments that aren't cancelled
    quantity: number,
} & AutomatedMessageContactCriteriaAppointmentOptions