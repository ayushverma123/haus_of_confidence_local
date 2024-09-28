import { ThirdPartyService } from "../../../model/ThirdPartyService";
import { ValidContactType } from "../../GeneralContactsController/model/ValidContactType";

export interface TableRow {
    id: number,
    source_service: ThirdPartyService,
    destination_service: ThirdPartyService,
    contact_object: ValidContactType
}