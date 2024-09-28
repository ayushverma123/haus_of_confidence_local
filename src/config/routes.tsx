import { Fragment, ReactElement } from "react"
import { AuthorizationPage } from "../pages/AuthorizationPage"
import { AutomatedMessagesPage } from "../pages/automatedMessagesPage"
import { WebhookStatusesPage } from "../pages/webhookStatusesPage"
import { RouteConfigObject } from "../model/RouteConfigObject"
import { RouteConfigTuple } from "../model/RouteConfigTuple"
import { ContactInfoPage } from "../pages/contactInfoPage"

// Configures the Top Navigation Bar's links
export const routes: { [endpoint: string]: RouteConfigObject } = {
    "Dashboard": {
        name: "Dashboard",
        path: '/',
        element: <Fragment></Fragment>,
        hideFromNav: false,
    },
    "AutomatedMessagesPage": {
        name: "Automated Messages",
        path: "/automatedMessages",
        element: < AutomatedMessagesPage />,
        hideFromNav: false,
    },
    'WebhookStatuses': {
        name: 'Webhooks',
        path: '/webhooks',
        element: <WebhookStatusesPage />,
        hideFromNav: false,
    },
    "AuthorizationPage": {
        name: "Authorization",
        path: "/authorization",
        element: <AuthorizationPage />,
        hideFromNav: false,
    },
    // "ContactInfoPage": {
    //     name: "Contact Info",
    //     path: "/contact/*",
    //     element: <ContactInfoPage />,
    //     hideFromNav: true,
    // }
}

export const routeKeys = Object.keys(routes)
export const routesConfig: RouteConfigTuple[] = 
  Array.from(Array(routeKeys.length).keys())
    .map((routeIndex) => 
      [routes[routeKeys[routeIndex]].path, routes[routeKeys[routeIndex]].element])

