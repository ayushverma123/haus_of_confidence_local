import { ReactElement } from "react";

export type RouteConfigObject = {
    name: string,
    path: string,
    element: ReactElement,
    hideFromNav: boolean,
}
