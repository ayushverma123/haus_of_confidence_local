import { AutomatedMessageContactCriteriaAppointmentEntry } from "./AutomatedMessageContactCriteriaAppointment";
import { AutomatedMessageContactCriteriaEmail } from "./AutomatedMessageContactCriteriaEmail";
import { AutomatedMessageContactCriteriaName } from "./AutomatedMessageContactCriteriaName";
import { AutomatedMessageContactCriteriaPhoneNumber } from "./AutomatedMessageContactCriteriaPhoneNumber ";
import { AutomatedMessageTagsConfigEntry } from "../AutomatedMessageTagsConfigEntry";
import { AutomatedMessageCustomIncludeExcludeConfigurationEntry } from "../AutomatedMessageCustomIncludeExcludeConfigurationEntry";
import { AutomatedMessageSpecificDateConfigurationEntry } from "../AutomatedMessageSpecificDate";
import { AutomatedMessageContactCriteriaNumberOfAppointments } from "./AutomatedMessageContactCriteriaNumberOfAppointments";
import { AutomatedMessageContactCriteriaTimeAsCustomer } from "./AutomatedMessageContactCriteriaTimeAsCustomer";

export interface AutomatedMessageCustomContactCriteriaConfiguration {
    name?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaName, any>,
    email?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaEmail, any>,
    phone?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaPhoneNumber, any>,
    birthdate?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageSpecificDateConfigurationEntry, any>,
    specificDate?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageSpecificDateConfigurationEntry, any>,
    appointment?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaAppointmentEntry, any>,
    tags?: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageTagsConfigEntry, any>,
    numberOfAppointments: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaNumberOfAppointments, any>,
    timeAsCustomer: AutomatedMessageCustomIncludeExcludeConfigurationEntry<AutomatedMessageContactCriteriaTimeAsCustomer, any>
}

export type ValidAutomatedMessageCustomContactCriteria = 
AutomatedMessageContactCriteriaName |
AutomatedMessageContactCriteriaEmail |
AutomatedMessageContactCriteriaPhoneNumber |
AutomatedMessageSpecificDateConfigurationEntry |
AutomatedMessageContactCriteriaAppointmentEntry |
AutomatedMessageTagsConfigEntry |
AutomatedMessageContactCriteriaNumberOfAppointments |
AutomatedMessageContactCriteriaTimeAsCustomer

export type AutomatedMessageCustomContactCriteriaMapping <T, > = Map<AutomatedMessageCustomContactCriteria,T>
// {[key in AutomatedMessageCustomContactCriteria]: T}


export enum AutomatedMessageCustomContactCriteria {
    // Name = "name",
    // Email = "email",
    // Phone = "phone",
    Birthdate = "birthdate",
    SpecificDate = "specificDate",
    Appointment = "appointment",
    Tags = "tags", // Contact Tags
    NumberOfAppointments = "numberOfAppointments",
    TimeAsCustomer = "timeAsCustomer"
}


// TODO -- Test the objects below
/* //TODO - TEST -- Example of object that sends a message to every contact that has cancelled an appointment within the last month, 
 TODO               starting 3 days after the cancellation date, repeating every 4 days and 12 hours, and ending 31 days after the cancellation date:

    {
        "appointment": {
            "use": true,
            "includes": [{
                "timeDistances": [
                    {
                        "direction": "forward",
                        "distance": {
                            "days": 3,
                            "hour": 0,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "distanceFrom": "lastCancelledAppointment",
                        "repeat": true,
                        "repeatConfiguration": {
                            "days": 4,
                            "hour": 12,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "endRepeat": {
                            "direction": "forward",
                            "endTime": {
                                "days": 31,
                                "hour": 0,
                                "minutes": 0,
                                "seconds": 0
                            }
                        }
                    }
                ]
            }]
        }
    }
*/

/* //TODO -- Test -- Example of object that sends a reminder to every contact that has an appointment in the next two days, no repeating
    {
        "appointment": {
            "use": true,
            "includes": [{
                "timeDistances": [
                    {
                        "direction": "backwards",
                        "distance": {
                            "days": 2,
                            "hour": 0,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "distanceFrom": "nextAppointment",
                        "repeat": false
                    }
                ]
            }]
        }
    }

*/

/* Example of object that sends a reminder to every contact the day of their birthdate, no repeating
    {
        "birthdate": {
            "use": true,
            "includes": [{
                "timeDistances": [
                    {
                        "direction": "forward",
                        "distance": {
                            "days": 0,
                            "hour": 0,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "distanceFrom": "specificDate",
                        "repeat": false
                    }
                ]
            }]
        }
    }

*/

/* Example of object that sends a reminder to every contact that has had an appointment completed in the last 30 days with the tags "Lipo" that they used to be a fatty, repeating every 10 days for 6 months after the completion date:
    {
        "appointment": {
            "use": true,
            "includes": [{
                "timeDistances": [
                    {
                        "direction": "forward", //? Forward is for AFTER the distanceFrom, backwards means activate before. Here, with timeInclusive set, it will be all between lastCompletedAppointment and 30 days from then. If not inclusive, only 30 days and more
                        "distance": {
                            "days": 30,
                            "hour": 0,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "distanceFrom": "lastCompletedAppointment",
                        "timeInclusive": true,
                        "repeat": true,
                        "repeatConfiguration": {
                            "days": 10,
                            "hour": 0,
                            "minutes": 0,
                            "seconds": 0
                        },
                        "endRepeat": {
                            "direction": "forward",
                            "endTime": {
                                "months": 6,
                                "days": 0,
                                "hour": 0,
                                "minutes": 0,
                                "seconds": 0
                            }
                        }
                    }],
                "tags": {
                    "use": true,
                    "includes": [{
                        "tags": ["Lipo"]
                    }]
                }
            }] 
        }
    }
*/

/* Example of object that sends a text to all customers that have been customers for a year
    {
        "timeAsCustomer": {
            "use": true,
            "includes": [{
                timeAsCustomer: {
                    years: 1,
                    months: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                }
            }]
        }
*/


/* Example of object that sends a text to all customers that have completed 5 appointments
    {
        "numberOfAppointments": {
            "use": true,
            "includes": [{
                "quantity": 5,
                "onlyCompleted": true,
            }]
        }
*/