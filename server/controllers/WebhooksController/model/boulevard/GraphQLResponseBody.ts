import { Edge } from "./Edge"
import { PageInfo } from "./PageInfo"

export type GraphQLResponseBody<T,> = {
    edges: Edge<T>[],
    pageInfo: PageInfo
}