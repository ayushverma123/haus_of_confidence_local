import { PageInfo } from "../../../../controllers/WebhooksController/model/boulevard/PageInfo";
import { ServiceEdge } from "./ServiceEdge";

export interface ServiceConnection {
    edges: Array<ServiceEdge>,
    pageInfo: PageInfo
}