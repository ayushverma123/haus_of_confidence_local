import { ThirdPartyServiceMap } from "../../../model/ThirdPartyService"
import { SortedContacts } from "../../oneTimeContactSyncTask"
import { ImportReportEntry } from "./ImportReportEntry"
import { SyncToServicesResultEntry } from "./SyncToServicesResultEntry"

export type InitialContactImportState = {
    // all: boolean,
    importedFrom: ThirdPartyServiceMap<boolean>,
    // syncedTo: ThirdPartyServiceMap<boolean>,
    syncCompleted: boolean,
    beforeImportReport: ImportReportEntry[],
    afterImportReport: SyncToServicesResultEntry[],
    allowImport: boolean,
    syncObject: SortedContacts
}