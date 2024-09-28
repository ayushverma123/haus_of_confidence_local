import { GeneralContact } from "../../../model/GeneralContact";
import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { AutomatedMessagesCustomFunction } from "../model/AutomatedMessageConfigurationEntry";

// TODO
//@ts-ignore
export const customTriggerFunction = (currentTime: Date, allContacts: GeneralContact[], allAppointments: BoulevardAppointmentsTableRow[]): Promise<boolean> => {

    try {
        
    } catch (error) {
        console.error(`Error in custom trigger function`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}