import { useObserver } from 'mobx-react-lite'
import React, { Fragment, useEffect, useState } from 'react'
import { Card, Dimmer, List, Loader } from 'semantic-ui-react'
import { io } from 'socket.io-client'
import { andReduction } from '../helpers/arrayFunctions'
import { WebhookExclusionsList } from '../model/WebhookExclusionsList'
const socket = io()

type _StatusReport = {[key: string]: {[key: string]: boolean}}

const numberOfLoadingItems = 3

export const WebhookStatusesPage: React.FC = () => {
    // [ Podium Webhooks, Exclusions List ]
    const [pageLoading, setPageLoading] = useState<boolean[]>(Array(numberOfLoadingItems).fill(true)) 

    const [webhookStatusReport, setWebhookStatusReport] = useState<_StatusReport>({})

    //@ts-ignore
    const [webhookExclusionsList, setWebhookExclusionsList] = useState<WebhookExclusionsList>({})

    socket.on("RESPONSE_getWebhookExclusionsList", (exclusionsList: string) => {
        const exclusionList: WebhookExclusionsList = JSON.parse(exclusionsList)

        setWebhookExclusionsList(exclusionList)

        setPageLoading((oldValue) => {
            const [blvdWebhookLoad, podiumWebhookLoad, _] = oldValue

            return [blvdWebhookLoad, podiumWebhookLoad, false]
        })
    })


    socket.on("RESPONSE_webhookStatus", (webhookStatus: string) => {
        // TODO -- Get first key from webhookStatus
        const report: _StatusReport = JSON.parse(webhookStatus)
        const service: string = Object.keys(report)[0]

        setWebhookStatusReport(oldValue => ({
            ...oldValue,
            [service]: report[service]
        }))

        const servicePositions = [
            "Podium",
            "Boulevard"
        ]

        const position = servicePositions.findIndex(_service => _service === service)

        setPageLoading((oldValue) => {

            // const result: boolean[] = Array.from(Array(servicePositions.length)).map((_, i) => i)
            const result: boolean[] = oldValue.slice(0, numberOfLoadingItems - 1).reduce((acc, cv, i) => {
                const check = position === i 
                const entries = report[service]

                return check ? [...acc, typeof(entries) === 'undefined'] : [...acc, cv]
            }, [] as boolean[])

            return [...result, oldValue[numberOfLoadingItems - 1]]
        })

    })

    useEffect(() => {
        socket.emit("REQUEST_getWebhookExclusionsList")
        socket.emit("REQUEST_webhookStatus", "Podium")
        socket.emit("REQUEST_webhookStatus", "Boulevard")
    }, [])

    // useEffect(() => {
    //     console.log(webhookStatusReport)
    // }, [webhookStatusReport])

    //@ts-ignore
    const uglifyWebhookStatuses = (service, webhookStatusReport) => {
        //@ts-ignore
        const exclusionList = webhookExclusionsList[service]

        const keyMapping = {
            //#region Boulevard
            AppointmentCreated: "appointment.created",
            AppointmentUpdated: "appointment.updated",
            AppointmentCancelled: "appointment.cancelled",
            AppointmentCompleted: "appointment.completed",
            AppointmentRescheduled: "appointment.rescheduled",
            AppointmentActive: "appointment.active",
            AppointmentConfirmed: "appointment.confirmed",
            AppointmentArrived: "appointment.arrived",   
            //#endregion

            //#region Podium
            ContactCreated: "contact.created",
            ContactDeleted: "contact.deleted",
            ContactMerged: "contact.merged",
            ContactUpdated: "contact.updated",
            MessageFailed: "message.failed",
            MessageSent: "message.sent",
            //#endregion

            //#region GHL
            OpportunityCreated: "opportunity.created",
            OpportunityDeleted: "opportunity.deleted",
            OpportunityStatusUpdate: "opportunity.status.update",
            OpportunityAssignedToUpdate: "opportunity.assigned.to.update",
            OpportunityMonetaryValueUpdate: "opportunity.monetary.value.update",
            OpportunityStageUpdate: "opportunity.stage.update",
            //#endregion
        } 

        //@ts-ignore
        const modifiedList: WebhookStatusReport = Object.keys(webhookStatusReport[service]).reduce((acc, key: string) => 
        //@ts-ignore
            exclusionList[keyMapping[key]] ? acc : {
                ...acc,
                [key]: webhookStatusReport[service][key]
            }, {})

        return (
            <List>
                {
                    Object.keys(modifiedList).map((key: string) => {
                        //@ts-ignore
                        const name = modifiedList[key] ? "checkmark" : "warning sign"
                        return (
                            <List.Item key={key}>
                                <List.Icon name={name} />
                                <List.Content>{key}</List.Content>
                            </List.Item>
                        )
                    })
                }
            </List>
        )
    }
    
    const serviceCard = (serviceName: string, webhookStatuses: any) => (
        <Card>
            <Card.Content header={serviceName} />
            <Card.Content>
                <Card>
                    <Card.Content>
                        {/* A list will go here showing the status of each webhook */}
                        { webhookStatuses }
                    </Card.Content>
                </Card>
            </Card.Content>
        </Card>
    )

    const pageLoaded = andReduction(pageLoading.map(value => !value))

    const podiumCard = pageLoaded ? serviceCard("Podium",  uglifyWebhookStatuses("Podium", webhookStatusReport)) : undefined
    const boulevardCard = pageLoaded ? serviceCard("Boulevard", uglifyWebhookStatuses("Boulevard", webhookStatusReport)) : undefined

    return useObserver(() => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto',
            marginRight: 'auto',
            marginLeft: 'auto'
            // width: '80vw',
            // minWidth: '200px',
            // maxWidth: '500px'
        }}>
            <Dimmer.Dimmable dimmed={!pageLoaded}>
                <Dimmer inverted active={!pageLoaded} style={{height: '100vh'}}>
                    <Loader />
                </Dimmer>
                <Fragment>
                    { podiumCard }
                    { boulevardCard }
                </Fragment>
            </Dimmer.Dimmable>
        </div>
    ))
}