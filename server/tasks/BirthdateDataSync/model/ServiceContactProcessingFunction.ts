import { GeneralContact } from "../../../model/GeneralContact";

export type ServiceContactProcessingFunction  = (contacts: GeneralContact[])=> Promise<boolean>
