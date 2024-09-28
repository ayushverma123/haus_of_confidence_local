import React, { useState, useEffect, Fragment } from 'react'
import { Button, Dimmer, Loader, Card, Icon, Accordion, List } from 'semantic-ui-react'
import { io } from 'socket.io-client'
import { storeContext as userAccountStoreContext } from '../stores/userAccountStore'
import { StoreProvider as UserAccountStore } from '../stores/userAccountStore'
import { andReduction } from '../helpers/arrayFunctions'
// import { WebhookExclusionsList } from '@server/controllers/WebhooksController/model/WebhookExclusionsList'
// import { ThirdPartyService } from '@server/model/ThirdPartyService'
// import { WebhookTypeMap } from '@server/controllers/WebhooksController/model/WebhookType'
// import { WebhookStatusReport } from '@server/controllers/WebhooksController/model/WebhookStatusReport'
import { useObserver } from 'mobx-react-lite'
import { authorized as authorizedIcon } from '../components/icon/authorized'
import { unauthorized as unauthorizedIcon } from '../components/icon/unauthorized'


const socket = io()
const numberOfLoadingItems = 4

export const AuthorizationPage: React.FC = () => {
    const userAccountStore = React.useContext(userAccountStoreContext)
    if (!userAccountStore) throw Error("UserAccountStore shouldn't be null")

    // [Auth Link, Auth Status, GHL Auth Link, GHL Auth Status]
    const [pageLoading, setPageLoading] = useState<boolean[]>(Array(numberOfLoadingItems).fill(true)) 

    const [podiumAuthLink, setPodiumAuthLink] = useState<string>("")
    const [authorizedWithPodium, setAuthorizedWithPodium] = useState<boolean>(false)

    const [ghlAuthLink, setGhlAuthLink] = useState<string>("")
    const [authorizedWithGhl, setAuthorizedWithGhl] = useState<boolean>(false)

    socket.on("RESPONSE_podiumAuthCodeURL", (redirectUrl: string) => {
        setPodiumAuthLink(JSON.parse(redirectUrl))
        setPageLoading((oldValue) => {
            const [_, statusLoad, ghlLinkLoad, ghlAuthStatus] = oldValue

            return [false, statusLoad, ghlLinkLoad, ghlAuthStatus]
        })
    })

    socket.on("RESPONSE_podiumAuthStatus", (authorized: string) => {
        setAuthorizedWithPodium(JSON.parse(authorized))

        setPageLoading((oldValue) => {
            const [linkLoad, _, ghlLinkLoad, ghlAuthStatus] = oldValue
            
            return [linkLoad, false, ghlLinkLoad, ghlAuthStatus]
        })
    })

    socket.on("RESPONSE_goHighLevelAuthCodeUrl", (redirectUrl: string) => {
        setGhlAuthLink(JSON.parse(redirectUrl))

        setPageLoading((oldValue) => {
            const [linkLoad, statusLoad, _, ghlAuthStatus] = oldValue

            return [linkLoad, statusLoad, false, ghlAuthStatus]
        })
    })

    socket.on("RESPONSE_goHighLevelAuthStatus", (authorized: string) => {
        setAuthorizedWithGhl(JSON.parse(authorized))

        setPageLoading((oldValue) => {
            const [linkLoad, statusLoad, ghlLinkLoad, _] = oldValue

            return [linkLoad, statusLoad, ghlLinkLoad, false]
        })
    })

    useEffect(() => { 
        socket.emit("REQUEST_podiumAuthCodeURL") 
        socket.emit("REQUEST_podiumAuthStatus")
        socket.emit("REQUEST_goHighLevelAuthCodeUrl")
        socket.emit("REQUEST_goHighLevelAuthStatus")
    }, [])

    const authButton = (isAuthorized: boolean, url: string, serviceName: string) => (
        <Button as="a" 
                disabled={isAuthorized} 
                href={isAuthorized ? undefined : url} 
                target={isAuthorized ? undefined : "_blank"}
                color={isAuthorized ? undefined : "blue"}
            >
                { isAuthorized ? `${serviceName} is Connected` : `Authorize with ${serviceName}` }
        </Button>
    )
    
    const serviceCard = (serviceName: string, isAuthorized: boolean, authButton: any) => (
        <Card>
            <Card.Content header={serviceName} />
            <Card.Content>
                <Card>
                    <Card.Content header="Authorization" />
                    <Card.Content>
                        { authButton }
                    </Card.Content>
                    <Card.Content extra>
                        { isAuthorized ? (
                            <Fragment>
                                { authorizedIcon}
                                <span>{`Connected with ${serviceName}`}</span>
                            </Fragment>
                            ) : (
                            <Fragment>
                                { unauthorizedIcon }
                                <span>{`Not Connected with ${serviceName}`}</span>
                            </Fragment>
                        )}
                    </Card.Content> 
                </Card>
            </Card.Content>
        </Card>
    )

    // const podiumAuthButton = authButton(authorizedWithPodium, podiumAuthLink, "Podium")
    // const ghlAuthButton = authButton(authorizedWithGhl, ghlAuthLink, "GoHighLevel")
    const podiumCard = serviceCard("Podium", authorizedWithPodium, authButton(authorizedWithPodium, podiumAuthLink, "Podium"))
    const ghlCard = serviceCard("GoHighLevel", authorizedWithGhl, authButton(authorizedWithGhl, ghlAuthLink, "GoHighLevel"))

    const pageLoaded = andReduction(pageLoading.map(value => !value))

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
            <Dimmer.Dimmable dimmed={!pageLoaded} page>
                <Dimmer inverted active={!pageLoaded} style={{height: '100vh'}}>
                    <Loader />
                </Dimmer>
                <Fragment>
                    { podiumCard }
                    { ghlCard }
                </Fragment>
            </Dimmer.Dimmable>
        </div>
    ))
}