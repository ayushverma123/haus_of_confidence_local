export type WebPathHelper = (string) => string

export const WebPathHelper = (routeRoot: string): WebPathHelper => 
    (endpoint: string) => `${routeRoot}${ endpoint != '/' ? `${endpoint}` : '/'}`