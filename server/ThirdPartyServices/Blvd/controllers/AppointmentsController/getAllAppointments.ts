import { getAllGraphQlPages } from "../../../../helpers/GraphQLPaginationHelper";
import { Maybe } from "../../../../model/Maybe";
import { StateProperties, getValue } from "../../StateManager/BlvdStateManager";
import { Appointment, graphQlBody as appointmentQueryBody } from "../../model/Appointment";
import { Location } from "../../model/Location";

export const getAllAppointments = async (): Promise<Appointment[]> => {
    try {

        const locationData: Maybe<Location> = await getValue<Location>(StateProperties.location)

        const hasLocationData = typeof(locationData) !== 'undefined'

        const appointments: Array<Appointment> = await getAllGraphQlPages<Appointment>(
            'appointments', 
            100, 
            appointmentQueryBody, 
            `locationId: "${hasLocationData ? locationData.id: process.env.BLVD_LOCATION_ID}"`,
            2000
        )
        
        return new Promise(resolve => resolve(appointments))

    } catch (error) {
        console.error(`Unable to fetch appointments from Boulevard`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}