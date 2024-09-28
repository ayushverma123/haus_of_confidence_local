import { GeneralContact } from "../../../model/GeneralContact"
import { Maybe } from "../../../model/Maybe"
import { ThirdPartyService } from "../../../model/ThirdPartyService"

export type SyncToServicesResultEntry = {
    // id: string,
    contact: GeneralContact,
    source: ThirdPartyService,
    target: ThirdPartyService,
    success: boolean,
    error?: Maybe<Error>
}