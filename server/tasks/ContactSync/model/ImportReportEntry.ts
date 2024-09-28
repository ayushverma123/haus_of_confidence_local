import { ValidContactType } from "../../../controllers/GeneralContactsController/model/ValidContactType"
import { ThirdPartyService } from "../../../model/ThirdPartyService"

export type ImportReportEntry = {
    generalContactId: string,
    originalService: ThirdPartyService,
    targetService: ThirdPartyService,
    originalContactObject: ValidContactType,
    targetContactObject: ValidContactType,
}