import { DataType } from "./DataType"
import { OwnerResource } from "./OwnerResource"

export type ContactAttribute = {
    dataType: DataType,
    label: string,
    ownerResource: OwnerResource,
    uid: string,
    value: string
}

