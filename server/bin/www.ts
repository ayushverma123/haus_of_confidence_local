require('dotenv').config()

import { defaultServerName, hasFrontendBootMessage, trueFalseEnabledDisabled, usingSocketsMessage, } from "../resources/strings";
import { hasRequiredEnvironmentVariables } from "./bootCheck";
import { checkEnvBooleanValue } from "../helpers/envFunctions";
import { modifyAllowImportValue } from "../tasks/ContactSync/StateManager";
import { AutomatedMessageTemplateType } from "../controllers/AutomatedMessagesController/model/AutomatedMessageTemplateType";
import { createNewAutomatedMessageConfiguration } from "../controllers/AutomatedMessagesController/tableController/createNewAutomatedMessageConfiguration";
import { AutomatedMessageTrigger } from "../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger";
import { AutomatedMessageContactCriteria } from "../controllers/AutomatedMessagesController/model/AutomatedMessageContactCriteria";
import { GeneralContact } from "../model/GeneralContact";
import { checkForLocationDataOnStart } from "../ThirdPartyServices/Blvd/controllers/LocationsController/checkForLocationDataOnStart";
import {  ContactCriteriaFunctionReturn } from "../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry";
import { BoulevardAppointmentsTableRow } from "../controllers/BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";

import { addDays, format, getYear, setHours, setMinutes, setSeconds } from 'date-fns'

import { generateDataObject } from "../controllers/AutomatedMessagesController/configurationProcessor/dataObjectGenerator";
import { getAllAutomatedMessageConfigurationsForTriggerType } from "../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurationsForTriggerType";
import { processAutomatedMessageConfigurationEntry } from "../controllers/AutomatedMessagesController/configurationProcessor";
import { generateMessageStringFromTemplateType } from "../controllers/AutomatedMessagesController/configurationProcessor/templateProcessor";
import { getDatabaseAppointmentWithId } from "../controllers/BoulevardAppointmentsTableController/getDatabaseAppointmentWithId";
import { generateNumberRange } from "../helpers/ArrayFunctions";
import { createNewAutomatedMessageLockEntry } from "../controllers/AutomatedMessagesController/locksTable/createNewAutomatedMessageLockEntry";
import { AutomatedMessageLockType } from "../controllers/AutomatedMessagesController/model/AutomatedMessageLockType";
import { addIdsToAutomatedMessageLockEntry } from "../controllers/AutomatedMessagesController/locksTable/addIdsToAutomatedMessageLockEntry";
import { getAutomatedMessageLockEntryWithId } from "../controllers/AutomatedMessagesController/locksTable/getAutomatedMessageLockEntryWithId";
import { removeIdsFromAutomatedMessageLockEntry } from "../controllers/AutomatedMessagesController/locksTable/removeIdsFromAutomatedMessageLockEntry";
import { removeAllIdsFromAutomatedMessageLockEntry } from "../controllers/AutomatedMessagesController/locksTable/removeAllIdsFromAutomatedMessageLockEntry";
import { getAllAutomatedMessageLockEntries } from "../controllers/AutomatedMessagesController/locksTable/getAllAutomatedMessageLockEntries";
import { getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate } from "../controllers/AutomatedMessagesController/locksTable/getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate";
import { setDateTimeToStartOfDay } from "../helpers/setDateTimeToStartOfDay";
import { removeAutomatedMessageLockEntry } from "../controllers/AutomatedMessagesController/locksTable/removeAutomatedMessageLockEntry";
import { getAllAutomatedMessageConfigurations } from "../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurations";
import { turnHoursArrayIntoChosenDateHours } from "../helpers/dateTimeFunctions";
import { getAutomatedMessageConfigurationWithId } from "../controllers/AutomatedMessagesController/tableController/getAutomatedMessageConfigurationWithId";
import { createNewWebhooksQueueEntry } from "../controllers/WebhooksQueue/tableController/createNewWebhooksQueueEntry";
import { WebhookType } from "../controllers/WebhooksController/model/WebhookType";
import { ThirdPartyService } from "../model/ThirdPartyService";
import { getAllWebhooksQueueEntries } from "../controllers/WebhooksQueue/tableController/getAllWebhooksQueueEntries";
import { updateWebhooksQueueEntryProcessedValues } from "../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryProcessedValues";
import { removeWebhooksQueueEntry } from "../controllers/WebhooksQueue/tableController/removeWebhooksQueueEntry";
import { addTimeToDate } from "../controllers/AutomatedMessagesController/configurationProcessor/helpers/addTimeToDate";
import { TimeUnit } from "../controllers/AutomatedMessagesController/model/AutomatedMessageTimeConfigEntry";
import { convertAutomatedMessageTimeConfigEntryToDate } from "../controllers/AutomatedMessagesController/configurationProcessor/helpers/convertAutomatedMessageTimeConfigEntryToDate";
import { convertDateToAutomatedTimeConfigEntry } from "../controllers/AutomatedMessagesController/configurationProcessor/helpers/convertDateToAutomatedTimeConfigEntry";
import { removeExcludedTimeUnits } from "../controllers/AutomatedMessagesController/configurationProcessor/helpers/removeExcludedTimeUnits";
import { getAllDatabaseAppointments } from "../controllers/BoulevardAppointmentsTableController/getAllDatabaseAppointments";
import { filterAppointmentsByModifiers } from "../controllers/AutomatedMessagesController/configurationProcessor/helpers/filterAppointmentsByModifiers";
import { createNewGHLOpportunityRow } from "../controllers/GHLOpportunitiesController/createNewGHLOpportunityRow";
import { OpportunityStatus } from "../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus";
import { getAllGHLOpportunityRows } from "../controllers/GHLOpportunitiesController/getAllGHLOpportunityRows";
import { getGHLOpportunityRowById } from "../controllers/GHLOpportunitiesController/getGHLOpportunityRowById";
import { updateGHLOpportunityRow } from "../controllers/GHLOpportunitiesController/updateGHLOpportunityRow";
import { findGeneralContact } from "../controllers/GeneralContactsController/findGeneralContact";
import { convertGeneralContactToThirdPartyContact, convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getAllGeneralContacts, getGeneralContactWithPrimaryKey, storeGeneralContactInDatabase, updateGeneralContactBirthdateValue, updateGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../controllers/GeneralContactsController";
import { getGHLRegistrationStatus } from "../ThirdPartyServices/GoHighLevel/stateManager";
import { Opportunity } from "../ThirdPartyServices/GoHighLevel/model/Opportunity";
import { Contact } from "../ThirdPartyServices/GoHighLevel/model/Contact";
import { Client } from "../ThirdPartyServices/Blvd/model/Client";
import { getBirthdateAttributeId } from "../ThirdPartyServices/Podium/controllers/ContactAttributesController/StateManager";
import { getContactWithPhoneEmailOrConvoUid } from "../ThirdPartyServices/Podium/controllers/ContactController";

const express = require('express')
const app = express()

const path = require('path');
const http = require('http');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const hasFrontend = true
const useSockets = true
const hasName = typeof(process.env.INTERNAL_SERVER_NAME) !== 'undefined' && process.env.INTERNAL_SERVER_NAME !== ''

const httpOrHttps = (isHttps: boolean) => isHttps ? "HTTPS" : "HTTP"

if (!hasRequiredEnvironmentVariables(false)) {
    if (process) process.exit()
}

const serverPort = process.env.PORT

export const rootPath = path.join(__dirname, '../..', 'build')
export const renderRoot = (res) => res.sendFile('index.html', { root: rootPath })
export const staticRoot = path.join(__dirname, '../..' , 'build/static')
 
//Configure app
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

//#region Add static path, root file paths, custom routes, and React app routes

// Add static path
app.use('/static', express.static(staticRoot, { redirect: false }));

// Add route paths
app.get('/favicon.ico', (_, res) => res.sendFile(`${rootPath}/favicon.ico`))
app.get('/asset-manifest.json', (_, res) => res.sendFile(`${rootPath}/asset-manifest.json`))
app.get('/manifest.json', (_, res) => res.sendFile(`${rootPath}/manifest.json`))

if (checkEnvBooleanValue(process.env.NO_ROBOTS)) {
    app.get('/robots.txt', (req, res) => res.sendFile(`${rootPath}/robots.txt`))
}

const publicSharePath = `${rootPath}/share`
app.get("/share/:fileName(*)", (req, res, next) => res.sendFile(path.join(publicSharePath, `${req.params.fileName}`)))

// Add custom routes
require('../routes').routes(app)

// Add React app route
//! Should always be the last routes added
// Catch All (for react app)
if (hasFrontend) {
    app.get("/*", (_, res) => renderRoot(res))
}
//#endregion

// Create HTTP/S server with socketIO functionality
const server = /* useTls ? https.createServer(sslOptions, app) : */ http.createServer(app)
const socketIOServer = require('socket.io')(server)

// Attach server functions to server
const serverFunction = useSockets ? require('../sockets').socketServerFunctions : undefined
if (useSockets) {
    socketIOServer.on('connection', serverFunction)
}

//Create HTTP server

const bootOptionMessages: [string, string][] = [
    [usingSocketsMessage, trueFalseEnabledDisabled(useSockets)],
    [hasFrontendBootMessage, trueFalseEnabledDisabled(hasFrontend)],
]

server.listen(serverPort, () => {
	console.group(`${hasName ? process.env.INTERNAL_SERVER_NAME : defaultServerName} is serving ${httpOrHttps(false)} on port ${serverPort}`)
        bootOptionMessages
            .forEach((message: [string, string]) => console.log("•",message[0], message[1]))
    console.groupEnd()
})


//#region Custom Boot Code

//? This resets the boolean that prevents initialContactSync from progressing past compiling a report of what it will do every time the server restarts
modifyAllowImportValue(false)

//#endregion 

if (process.send) process.send!('ready')


//? Ensures that the Boulevard location is stored in the database
checkForLocationDataOnStart().then(success => {
    if (success) {

    //#region Cron Tasks

    const cronErrorHandler = (error) => { 
        console.group("----------- CRON TASK ERROR -----------")
        console.error(error)
        console.groupEnd()  
    }

    //? Podium Refresh Access Token Cron Task
    require('../ThirdPartyServices/Podium/tasks/refreshAccessTokenCronTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Podium Webhooks Maintenance Cron Task
    require('../ThirdPartyServices/Podium/tasks/webhooksMaintenanceTask')
        .withErrorHandler(cronErrorHandler)
        .activate() 

    //? Podium Initial Contact Import Cron Task
    require('../ThirdPartyServices/Podium/tasks/initialContactImportTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Boulevard Webhooks Maintenance Cron Task
    require('../ThirdPartyServices/Blvd/tasks/webhooksMaintenanceTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Boulevard Initial Client Import Cron Task
    require('../ThirdPartyServices/Blvd/tasks/initialClientImportTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Boulevard Appointments Import Cron Task
    require('../ThirdPartyServices/Blvd/tasks/initialAppointmentImportTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Populate Boulevard Tag Tracker
    require('../ThirdPartyServices/Blvd/tasks/populateTagTrackerTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? First time System-Wide contact sync after all first-time imports
    require('../tasks/oneTimeContactSyncTask').contactSyncTask
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? GoHighLevel Refresh Access Token Cron Task
    require('../ThirdPartyServices/GoHighLevel/tasks/refreshAccessTokenCronTask')
        .withErrorHandler(cronErrorHandler)
    //    .activate()

    //? Automated Messages Cron Task
    require('../tasks/AutomatedMessages')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Retry Failed Messages Cron Task
    require('../tasks/MessagesQueue/retryFailedMessagesTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Webhooks Queue Processing Cron Task
    require('../tasks/WebhooksQueue/processWebhooksQueueTask')
        .withErrorHandler(cronErrorHandler)
        .activate()

    //? Birthdate Sync Cron Task
    require('../tasks/BirthdateDataSync')
        .withErrorHandler(cronErrorHandler)
        .activate()
        
    //#endregion
    }
})

//#region TEST CODE

// console.log(generateSyncedWithServiceObject([ThirdPartyService.Podium, ThirdPartyService.Boulevard]))

// getAllClients().then(clients => {
//     //@ts-ignore
//     clients
//         .filter(({ externalId, tags }) => (typeof(externalId) !== 'undefined' || Object.is(externalId, null)) && tags.length > 0)
//         .filter(({ tags }) => tags.find(({name}) => name === 'supercharger' ) )
//         .forEach(client => {
//             console.log(client)
//     })
// })

// getAllGeneralContacts().then(contacts => {
//     contacts.forEach(contact => {
//         console.log(contact)
//     })
// })

// getAllContacts().then(contacts => {
    
//     // contacts.forEach(contact => {
//     //     console.log(contact)
//     // })
//     console.log(contacts)
//     console.log(contacts.length)
// })

// getGeneralContactWithPrimaryKey('22323').then(contact => {
//     console.group("Original Contact")
//         console.log(contact)
//     console.groupEnd()

//     console.group("Convert Contact")
//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, contact!).then(convertedContact => {
//         console.log(convertedContact)
//     })
//     console.groupEnd()

// })

// listLocalWebhooks(ThirdPartyService.Podium).then(webhooks => webhooks.forEach(webhook => console.log(webhook)))
// listRemoteWebhooks(ThirdPartyService.Boulevard).then(webhooks => console.log(webhooks.length))

// deleteAllRemoteWebhooks(ThirdPartyService.Boulevard).then(result => console.log(result))
// getAllClients().then(clients => {

//     [clients[0]].forEach((client, index) =>
//         convertContactToGeneralContact(ThirdPartyService.Boulevard, client, generateSyncedWithServiceObject([ThirdPartyService.Boulevard]))
//             .then(convertedContact => {
//                 // console.log(`CONVERTED CONTACT #${index + 1}`)
//                 // console.log(convertedContact)

//                 console.log("NEW CONTACT")
//                 convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, convertedContact)
//                 .then((contact) => console.log(contact))
//             }
//         )
//     )
// })

// getAllGeneralContacts(ThirdPartyService.Podium).then(contacts => console.log(contacts[0]))

// getClientInfoUsingId('urn:blvd:Client:f3c04f26-f580-4859-9d48-18b54515311b').then(client => {
//     console.log(client)
// })

// listRemoteWebhooks(ThirdPartyService.Boulevard).then(remoteWebhooks => console.log(remoteWebhooks))


//! This is how you convert a contact to another service type
//! Gotta convert it to a general contact first, every time
// getGeneralContactWithPrimaryKey('23975').then(contact => {

//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, contact!).then((finalContact) => {
//         console.group(`${contact!.original_service} to Boulevard`) 
//         console.log(finalContact)
//         console.groupEnd()
//     })
//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Podium, contact!).then((finalContact) => {
//         console.group(`${contact!.original_service} to Podium`) 
//         console.log(finalContact)

//         convertContactToGeneralContact(ThirdPartyService.Podium, finalContact as Contact, generateSyncedWithServiceObject([ThirdPartyService.Podium])).then((lastContact) => {
//             console.log("LAST CONTACT")
//             console.log(lastContact)
//         })
//         console.groupEnd()    
//     })
// })

//! Sync Testing
// getGeneralContactWithPrimaryKey('41464').then(contact => {
//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Podium, contact!).then((finalContact) => {
//         // console.group(`${contact!.original_service} to Boulevard`) 
//         console.log(finalContact)
//         console.groupEnd()
//     })
// })


//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Podium, contact!).then((finalContact) => {
//         console.group(`${contact!.original_service} to Podium`) 
//         console.log(finalContact)
//         console.groupEnd()    
//     })
// })



// getAllTags().then((tags) => console.log(tags))

// getClientInfoUsingId('urn:blvd:Client:75fee6e3-dd14-4af4-b43e-670da646c450').then(client => console.log(client))
// await updatePodiumOrganizationIdValue((await getLocationFromLocationUid(process.env.PODIUM_LOCATION_ID!))!.uid)

// getLocationFromLocationUid(process.env.PODIUM_LOCATION_ID!).then((location) => {
//     const { uid } = location!
//     console.log("UID", uid)
//     updatePodiumOrganizationIdValue(uid).then((value) => console.log("UPDATED MAYBE LOL", value))
// })

// getAllPodiumTags().then((tags) => console.log(tags))
// getContactWithPhoneEmailOrConvoUid('+16029094871').then(contact => console.log(contact))

// getServiceWebhookRegistrationStatus().then((status) => console.log(status))

// deleteAllRemoteWebhooks(ThirdPartyService.Boulevard).then(success => console.log(success))

// getLocationFromLocationUid(process.env.PODIUM_LOCATION_ID!).then((location) => console.log(location))

// getAllClients().then((clients) => { 
//     const result = clients.filter(({ mobilePhone, email}) => 
//     {
//         const hasPhone = (() => {
//             if (typeof(mobilePhone) === 'undefined' || Object.is(mobilePhone, null)) return false
//             if (mobilePhone!.length <= 0) return false
//             return true
//         })()

//         const hasEmail = (() => {
//             if (typeof(email) === 'undefined' || Object.is(email, null)) return false
//             if (email!.length <= 0) return false
//             return true
//         })

//         return hasPhone || hasEmail

//     })
//     console.log(result)
//  })

// type _importReport = { importReport: any }

// const testState = StateStore<_importReport>(`${systemServiceIdentifier}_initial_contact_sync`)
// testState.modifyValue<Object>('importReport', {success: true}).then(() => {
//     try {
//         console.log('success')
//     } catch (error) {
//         console.error('fail')
//         console.error(error)
//     }
// })

// modifyValue(StateProperties.beforeImportReport, {}).then(() => {
//     try {
//         console.log('success')
//     } catch (error) {
//         console.error('fail')
//         console.error(error)
//     }
// })

// refreshTagTracker().then(success => console.log(success))

// getGeneralContactWithPrimaryKey('41101').then(contact => {
//     syncContactToService[ThirdPartyService.Boulevard](contact!).then(success => console.log(success))
// })

// console.log(ThirdPartyService)

// listRemoteWebhooks(ThirdPartyService.Boulevard).then(webhooks => webhooks.forEach(_webhook => console.log(_webhook)))'

// getAllContacts().then(contacts => console.log(contacts.length))
    // contacts.forEach(contact => console.log(contact)))

//@ts-ignore
// modifyBeforeImportReportValue({}).then(success => console.log(success))

// getTagTracker().then(tagTracker => console.log(tagTracker))
// refreshTagTracker().then(success => console.log(success))
// getTagId('botox').then(tagId => console.log(tagId))
// addTagToTracker('tortillas', 'fantasic-burritos')

// Array(500).fill(0).forEach(() => {
//     //@ts-ignore
//     createNewAppointmentRow(41465, generateRandomString(256), {}).then(tableRow => {
//         // console.log(tableRow)

//         const { id } = tableRow

//         // updateAppointmentConfirmedValue(id, randomRange(0, 2) === 1)
//         // updateAppointmentCancelledValue(id, randomRange(0, 2) === 1)
//         // updateAppointmentActiveValue(id, randomRange(0, 2) === 1)
//         // updateAppointmentCompletedValue(id, randomRange(0, 2) === 1)
//     }
// )})

// getAllDatabaseAppointments().then(appointments => console.log(appointments))
// getAllDatabaseAppointmentsWithContactId(41469).then(appointments => console.log(appointments))
// getDatabaseAppointmentWithAppointmentId('test-appointment').then(appointments => console.log(appointments))
// getDatabaseAppointmentWithAppointmentAndContactId(41469, 'test-appointment').then(appointments => console.log(appointments))

// getDatabaseAppointmentWithId(3).then(appointments => console.log(appointments))

// updateScheduledMessageActiveValue(41136, ScheduledMessageType.AppointmentCompleted, true).then(success => console.log(success))
// getAllScheduledMessagesForContact(41136).then(scheduledMessages => console.log(scheduledMessages))


// modifyScheduledMessageTypeDefaultMessage(ScheduledMessageType.AppointmentCancelled, ['TEST', 'TEST2', 'TEST3', 'TEST4'] )

// getScheduledMessageDefaultMessage(ScheduledMessageType.AppointmentCancelled).then(success => console.log(success))

// console.log(Object.keys(ScheduledMessageType))

// const scheduledMessageTypeValueToTextUiMap: { [key: string]: string } = {
//     "appointment.active": "Appointment Active",
//     "appointment.arrived": "Appointment Arrived",
//     "appointment.confirmed": "Appointment Confirmed",
//     "appointment.created": "Appointment Created",
//     "appointment.cancelled": "Appointment Cancelled",
//     "appointment.completed": "Appointment Completed",
//     "appointment.rescheduled": "Appointment Rescheduled",
//     "appointment.updated": "Appointment Updated",
// }


// console.log( scheduledMessageTypeValueToTextUiMap[ScheduledMessageType['AppointmentConfirmed']])
// getAllScheduledMessageDefaults().then(scheduledMessageDefaults => console.log(scheduledMessageDefaults[ScheduledMessageType.AppointmentCancelled]))

// updateAlertTimeValue(41231, ScheduledMessageType.AppointmentActive, (new Date()).toISOString()).then(success => console.log(success))


// getContactWithPhoneEmailOrConvoUid("+15558918919").then(contact => console.log(contact))

// getClientInfoUsingId("urn:blvd:Client:e16c962b-78de-45b5-adb5-394c0aded6d4").then(clientInfo => {
//     // const { email, mobilePhone } = clientInfo!

//     const result = [clientInfo!].filter(filterClientsWithNoEmailAndNoPhone)

//     console.log(result)

// //     // console.log(email!.length <= 0)
// //     // console.log(clientInfo?.email)
// //     // console.log(email.length)

// })

// getAllClients().then(clients => console.log(clients.filter(filterClientsWithNoEmailAndNoPhone).length))




// createNewAutomatedMessageConfiguration(
//     "Test_4",
//     AutomatedMessageTrigger.CustomFunction,
//     AutomatedMessageTemplateType.Custom,
//     AutomatedMessageContactCriteria.Custom,
//     (async (currentTime: string): Promise<boolean> => {
//         console.log(currentTime)
//         return new Promise<boolean>((resolve) => resolve(false))
//     }),
//     ["TEST TEMPLATE TEXT"],
//     undefined,
//     (async (allContacts: GeneralContact[]): Promise<GeneralContact[]> => new Promise(resolve => resolve(allContacts.filter(contact => contact.emails.length > 0))))

// )


// const functionThing = JSONfn.stringify(async (currentTime: string, dataObject: any): Promise<boolean> => {
//     return new Promise<boolean>((resolve, reject) => resolve(false))
// })

// JSONfn.parse(functionThing)().then(item => console.log(item))


// getAllAutomatedMessageConfigurations().then(items => items[0].custom_trigger_function().then(success => console.log(success)))
// getAllAutomatedMessageConfigurationsForTriggerType(AutomatedMessageTrigger.CustomFunction).then(items => console.log(items))
// getAutomatedMessageConfigurationWithScheduleName('Get Current Time and Return False').then(entry => {
//     console.log(entry)

//     //@ts-ignore
//     entry!.customTriggerFunction(Date.now()).then(item => console.log(item))
// }) 
// const shortDateFormat: string = 'MM/dd/yyyy'
// const shortTimeFormat: string = 'hh:mm:ss aaa'


// getAllDatabaseAppointments().then(appointments => {
//     appointments.forEach(appointment => {
//         const { created_at } = appointment
//         const end_date = new Date().toISOString()

//         // console.log(typeof(format(parseISO(new Date(created_at).toISOString()), shortDateFormat)))
        
//         // console.log(format(parseISO(new Date(created_at).toISOString()), shortDateFormat))
//         // console.log(format(parseISO(new Date(created_at).toISOString()), shortTimeFormat))
//         // console.log(format(parseISO(new Date(created_at).toISOString()), shortTimeFormat))
//         console.log(intervalToDuration({
//             start: parseISO(new Date(created_at).toISOString()),
//             end: parseISO(end_date)
//         }))
//     })
// })


// getGeneralContactWithPrimaryKey(`${41101}`).then(contact => {

    // addNewMessageToQueue(contact!, PodiumMessageChannel.Email, MessageStatus.Pending, "Test Message")
// })


// addMessageTemplateForMessageType(AutomatedMessageTemplateType.AppointmentCancelled, "{firstname} {lastname} ({email}) says the current date is {date_current} and the time is {time_current}")

// modifyMessageTemplateForMessageType(AutomatedMessageTemplateType.AppointmentCancelled, 
//     "{firstname} {lastname} ({email}) says the current date is {date_current} and the time is {time_current}",
//     "{firstname} {lastname} ({email}) says the current date and time is {datetime_current}"
// )


// generateDataObject(undefined, `${41101}`).then(dataObject => {
//     generateMessageStringFromTemplateType(AutomatedMessageTemplateType.AppointmentCancelled, dataObject).then(message => {
//         console.log(message)
//    })
// })

// removeMessageTemplateForMessageType(AutomatedMessageTemplateType.AppointmentCancelled, "{firstname} {lastname} ({email}) says the current date and time is {datetime_current}")

// editMessageQueueEntryStatus(1, MessageStatus.Failed)
// getAllMessageQueueEntries().then(items => console.log(items))
// removeMessageQueueEntry(1).then(success => console.log(success))

// updateAutomatedMessageEntryStatus(75, false).then(success => console.log(success))
// removeAutomatedMessageConfigurationEntry(75).then(success => console.log(success))

// deleteAllRemoteWebhooks(ThirdPartyService.Boulevard)
// getAllAppointments().then(appointments => console.log(appointments))
// getAllLocations().then(locations => console.log(locations))

// getAllClients().then(clients => console.log(clients))

// refreshAccessToken().then(success => console.log(success))

// getGeneralContactWithPrimaryKey(`${41363}`).then(contact => {
//     sendPodiumMessage(contact!, PodiumMessageChannel.Email, "TEST MESSAGE").then(success => console.log(success))
// })

// getDatabaseAppointmentWithAppointmentId(`9062`).then(appointment => console.log(appointment))
// getDatabaseAppointmentWithId(`9062`).then(appointment => {
// //     // console.log(appointment)

//     generateDataObject(appointment.appointment_id, `41465`).then(dataObject => {
//         getAllAutomatedMessageConfigurationsForTriggerType(AutomatedMessageTrigger.BoulevardAppointmentCreated).then(configurations => {
//             processAutomatedMessageConfigurationEntry(configurations[0], dataObject).then(success => console.log(success))
//         })       
//         generateMessageStringFromTemplateType(AutomatedMessageTemplateType.Custom, dataObject, "TEST TEST TEST").then(message => {
//             console.log(message)
//         })
//     })
// })

// getAppointment('urn:blvd:Appointment:db84cb3d-89d1-400c-b95d-a775924066ee').then(appointment => console.log(appointment))
// generateMessageStringFromTemplateType(AutomatedMessageTemplateType.Custom,)

// createNewAutomatedMessageConfiguration(
//     "Appointment Created - General",
//     AutomatedMessageTrigger.BoulevardAppointmentCreated,
//     AutomatedMessageTemplateType.Custom,
//     AutomatedMessageContactCriteria.CurrentAction,
//     undefined,
//     ["Hi {firstname}, thank you for scheduling your {appointment_services} appointment with Haus of Confidence. We're excited to see you at {appointment_starttime} on {appointment_startdate_short} Let us know if you have any questions!"],
//     undefined
// )

// createNewAutomatedMessageConfiguration(
//     "9:30 Message, Only during Business Hours",
//     true,
//     AutomatedMessageTrigger.TimeSpecific,
//     AutomatedMessageTemplateType.Custom,
//     AutomatedMessageContactCriteria.CurrentAction,
//     undefined,
//     ["Hi {firstname}, thank you for scheduling your {appointment_services} appointment with Haus of Confidence. We're excited to see you at {appointment_starttime} on {appointment_startdate_short} Let us know if you have any questions!"],
//     { timeTriggers: [
//         {
//             hour: 9,
//             minutes: 30
//         }
//     ]},
//     undefined,
//     AutomatedMessageLockType.None,
//     {
//         start: {
//             hour: 8,
//             minutes: 0,
//         },
//         end: {
//             hour: 17,
//             minutes: 0,
//         }
//     }
// )

// console.log(formatInTimeZone(new Date(`2023-11-25T15:45:00-08:00`).toISOString(), "America/Los_Angeles", 'MM/dd/yyyy hh:mm:ss aaa'))
// console.log(format(new Date(`2023-11-25T15:45:00-00:00`), 'MM/dd/yyyy hh:mm:ss aaa OO'))

// console.log(typeof(format(new Date(), 'mm')))


// createNewWebhooksQueueEntry(WebhookType.AppointmentCreated, ThirdPartyService.Boulevard, {}, new Date())
// getAllWebhooksQueueEntries(WebhookType.AppointmentCreated).then(items => console.log(items))
// updateWebhooksQueueEntryProcessedValues(1, true).then(success => console.log(success))

// addTimeToDate(new Date(), {
//     years: 30,
//     days: 20,
//     hour: 12,
//     minutes: 30

// }).then(date => console.log(date))

// const testObject = {
//     [TimeUnit.Weeks]: 'SUCCESS'
// }

// console.log(testObject['weeks' as TimeUnit])
// const excludeAllButYear: TimeUnit[] = [ TimeUnit.Hour, TimeUnit.Minutes, TimeUnit.Days, TimeUnit.Months, TimeUnit.Seconds, TimeUnit.Milliseconds ]

// convertAutomatedMessageTimeConfigEntryToDate(convertDateToAutomatedTimeConfigEntry(new Date()), excludeAllButYear).then(date => console.log(format(date, 'MM/dd/yyyy hh:mm:ss aaa')))
// convertAutomatedMessageTimeConfigEntryToDate(convertDateToAutomatedTimeConfigEntry(new Date()), [ TimeUnit.Hour, TimeUnit.Minutes, TimeUnit.Days, TimeUnit.Months, TimeUnit.Seconds, TimeUnit.Milliseconds ]).then(date => console.log(date))
// console.log(format(new Date(0), 'MM/dd/yyyy hh:mm:ss aaa'))
// console.log(format(removeExcludedTimeUnits(new Date(), excludeAllButYear), 'MM/dd/yyyy hh:mm:ss aaa'))


// createNewGHLOpportunityRow(
//     OpportunityStatus.Open,
//     //@ts-ignore
//     {}, {id: 'testId3'})
//     .then(opportunity => console.log(opportunity))

// getAllGHLOpportunityRows().then(items => console.log(items))
// getGHLOpportunityRowById(2).then(opportunity => console.log(opportunity))

// updateGHLOpportunityRowStatus(1, OpportunityStatus.Won)
// .then(opportunity => console.log(opportunity))


// createNewWebhooksQueueEntry(
//     WebhookType.OpportunityCreated, 
//     ThirdPartyService.GoHighLevel, 
//     {}, 
//     new Date(),
//     {request: "Tacos"},
//     {response: "Tacos"}
// )
// .then(success => console.log(success))

// findGeneralContact({
//     // email: "eric@tomasso.tech"
//     // phoneNumber: "+16026449361"
//     firstName: "Test",
//     lastName: "Tester"
// }).then(generalContact => console.log(generalContact))

// getGeneralContactWithPrimaryKey(`${41100}`).then(generalContact => {
//     console.log("General Contact")
//     console.log(generalContact)

//     console.group("Conversions:")

//     Object.values(ThirdPartyService).forEach(service => {
//         convertGeneralContactToThirdPartyContact(service, generalContact!).then(thirdPartyContact => {
//             console.group(service, ':')
//             console.log(thirdPartyContact)
//             console.groupEnd()
//         })
//     })

//     console.groupEnd()

// })



// getGHLRegistrationStatus().then(status => console.log(status))


// updateGeneralContactServiceIdsValue(`${41100}`, ThirdPartyService.GoHighLevel, '121wqrsw3rw3').then(_ => 
//     updateGeneralContactSyncedWithServicesValue(`${41100}`, ThirdPartyService.GoHighLevel, true) 
// )

// createNewGHLOpportunityRow(OpportunityStatus.Abandoned, {id: '1221234123'} as Opportunity, {id: '1321323213'} as Contact).then(
//     opportunity => {
//         const { id } = opportunity

//         updateGHLOpportunityRow(id, undefined, undefined, undefined, 41100).then(
//             updatedOpportunity => {
//                 console.log(updatedOpportunity)
//             }
//         )
//     }
// )

// getGeneralContactWithPrimaryKey('41545').then(contact => {
//     console.group("Original Contact")
//         console.log(contact)
//     console.groupEnd()

//     console.group("Convert Contact")
//     convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, contact!).then(convertedContact => {
//         console.log(convertedContact)
//     })
//     console.groupEnd()

// })

// const blvdClient: Client = {
//     "id": "urn:blvd:Client:c9a0485d-a7bd-41b3-b792-fb30f818b98a",
//     "dob": "1986-10-12",
//     "name": "birthday client",
//     "tags": [
//     ],
//     "email": "sdscss@aol.com",
//     "notes": [
//     ],
//     "active": true,
//     "pronoun": undefined,
//     "lastName": "client",
//     "createdAt": "2024-01-23T23:06:12.417774Z",
//     "firstName": "birthday",
//     "updatedAt": "2024-01-23T23:06:12.417774Z",
//     "__typename": "Client",
//     "mobilePhone": "+385492029",
//     "primaryLocation": {
//       "address": {
//         //@ts-ignore

//         "zip": null,
//         //@ts-ignore

//         "city": null,
//         //@ts-ignore

//         "line1": null,
//         //@ts-ignore

//         "line2": null,
//         //@ts-ignore

//         "state": null,
//         //@ts-ignore

//         "country": null,
//         //@ts-ignore

//         "province": null
//       },
//       "businessName": "Glow Studio"
//     },
//     "appointmentCount": 0
//   }
  

// convertThirdPartyContactToGeneralContact(ThirdPartyService.Boulevard, blvdClient, generateSyncedWithServiceObject([ThirdPartyService.Boulevard])).then(generalContact => {
//     // console.log(generalContact)

//     // storeGeneralContactInDatabase(ThirdPartyService.Boulevard, generalContact!).then(storedGeneralContact => { 
//     //     console.log(storedGeneralContact) 
//     // })
//     updateGeneralContactInDatabase('41545', generalContact).then(updatedGeneralContact => console.log(updatedGeneralContact))
// })


// updateGeneralContactBirthdateValue('41545', new Date()).then(success => console.log(success))

// getBirthdateAttributeId().then(attributeId => {
//     getContactWithPhoneEmailOrConvoUid(`+15551239871`).then(contact => {
//         const birthdate = contact!.attributes.find(({ uid }) =>  uid === attributeId)?.value
//         console.log(`Birthdate: ${birthdate}`)    

//     })
// })

// getAllGeneralContacts(undefined, true, false).then(generalContactsWithoutBirthdates => {
//     console.log("Number of contacts without birthdates:", generalContactsWithoutBirthdates.length)

//     getAllGeneralContacts(undefined, false, true).then(generalContactsWithBirthdates => {
//         console.log("Number of contacts with birthdates:", generalContactsWithBirthdates.length)
//     })
// })



//#endregion
export {}

