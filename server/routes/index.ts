// import { asyncRoute } from "../helpers/AsyncRouteHelper"

// const express = require('express')
// const path = require('path')

// App's build location. Use to locate files on the client side
// const rootPath = require('../bin/www').rootPath

export const routes = (app: any) => {
    // Add routes from other files here first using 
    // require('./admin').routes(app)

    //#region Podium
    require('./services/podium/authReceiver').routes(app)
    require('./services/podium/webhooks/webhookReceiver').routes(app)
    require('./services/podium/webhooks/messages/messageSent').routes(app)
    require('./services/podium/webhooks/messages/messageFailed').routes(app)

    //#endregion

    //#region Boulevard
    require('./services/boulevard/webhookReceiver').routes(app)

    require('./services/boulevard/webhooks/appointments/appointmentActive').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentArrived').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentCancelled').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentCompleted').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentConfirmed').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentCreated').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentRescheduled').routes(app)
    require('./services/boulevard/webhooks/appointments/appointmentUpdated').routes(app)
    //#endregion

    //#region GoHighLevel
    require('./services/goHighLevel/authReceiver').routes(app)
    require('./services/goHighLevel/webhookReceiver').routes(app)
    
    //#endregion
}

