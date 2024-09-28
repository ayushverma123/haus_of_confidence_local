import { AutomatedMessageCustomIncludeExcludeConfigurationEntry } from "../AutomatedMessageCustomIncludeExcludeConfigurationEntry"
import { AutomatedMessageTimeConfigEntry } from "../AutomatedMessageTimeConfigEntry"
import { AutomatedMessageTagsConfigEntry } from "../AutomatedMessageTagsConfigEntry"
import { TimeDistanceConfiguration } from "../TimeDistance"
import { BoulevardAppointmentsTableRow } from "../../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow"
import { AutomatedMessageAppointmentServiceConfigEntry } from "./AutomatedMessageAppointmentServiceConfigEntry"
import { AutomatedMessageContactCriteriaAppointmentOptions } from "../AutomatedMessageContactCriteriaAppointmentOptions"

export type AutomatedMessageContactCriteriaAppointmentEntry = {
    // TODO -- Needs to be able to configure the function to look at previous appointments and calculate time distances between arbitrary dates such as now() and appointment times
    // TODO -- In addition to the above, I basically need to be able to configure a filter function on allAppointments.
    timeDistances?: TimeDistanceConfiguration[],
    tags?: AutomatedMessageTagsConfigEntry,
    appointmentInclusionOptions?: AutomatedMessageContactCriteriaAppointmentOptions,
    services?: AutomatedMessageAppointmentServiceConfigEntry, // TODO 
    appointments?: BoulevardAppointmentsTableRow[], //! NOT USED FOR CONFIGURATION, JUST DATA RETURN
}

//? So this works by defining a time distance from either the last appointment, the next appointment, or a special case when the last appointment was cancelled.
//? When LastAppoint or NextAppointment is used, the time distance will be calculated based on when the lastAppoint or nextAppointment is. TimeDistanceDirection can only go one way for each one.
//? When LatestAppointment_CancelledAppointment is used, the time distance will be calculated based on when the latest appointment was cancelled, if it was cancelled. TimeDistance must be backward here.
//? When repeat is used AND:
//?  • TimeDistanceFrom is LastAppointment or NextAppointment, the message will be sent every __ days / hours / minutes / seconds since the lastAppointment completed / cancelled or until the nextAppointment



//! Is TimeDistanceDirection actually needed?

// {
//     "urn:blvd:Appointment:f2e92072-b573-4eb6-806a-b4bb3aef6a14",
//     "urn:blvd:Appointment:12049b75-3502-4a78-86ca-c1de5a0c2a90",
//     "urn:blvd:Appointment:13acb57d-1b34-408c-809c-48d07be6e7c6",
//     "urn:blvd:Appointment:980941dd-c5d4-447a-9622-133c459d66f4",
//     "urn:blvd:Appointment:3ab6af6e-eade-4b04-9d1a-3aec702c5758",
//     urn:blvd:Appointment:cb0bc929-a18b-4482-a0a1-b58b3c859e62,
//     urn:blvd:Appointment:2067a28f-2feb-466b-b4e0-52588a6d5a2e,
//     urn:blvd:Appointment:e74fe155-397f-47fe-8e83-319c6054cc0c,
//     urn:blvd:Appointment:0bcd08e7-1474-48f8-9c3f-3528cbd604b1,
//     urn:blvd:Appointment:e4ae9e01-309d-4fa2-a234-688c9865694f,
//     urn:blvd:Appointment:36b4c954-4810-455b-bbc7-6a5439627d6f
// }