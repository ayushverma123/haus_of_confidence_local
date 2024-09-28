import service from "../../constants/systemServiceIdentifier"
import { StateStore } from "../../controllers/StateManager"
import { SortedContacts } from "../oneTimeContactSyncTask"
import { ImportReportEntry } from "./model/ImportReportEntry"
import { InitialContactImportState } from "./model/InitialContactImportState"
import { StateProperties } from "./model/StateProperties"

const stateId = `${service}_CONTACT_IMPORT`

export const _stateStore = StateStore<InitialContactImportState>(stateId)


export const getValue = async <T,>(property: StateProperties) => _stateStore.getValue<T>(property)
export const modifyValue = async<T,>(property: StateProperties, value: T) => _stateStore.modifyValue<T>(property, value)

export const modifyAllowImportValue = async (value: boolean) => modifyValue(StateProperties.allowImport, value)

export const modifySyncObjectValue = async (value: SortedContacts) => modifyValue(StateProperties.syncObject, value)
export const modifyBeforeImportReportValue = async (value: ImportReportEntry[]) => modifyValue(StateProperties.beforeImportReport, value)
