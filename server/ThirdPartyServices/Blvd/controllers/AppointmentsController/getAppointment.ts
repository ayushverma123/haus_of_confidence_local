import { gql } from "graphql-request";
import { Maybe } from "../../../../model/Maybe";
import { Appointment, graphQlBody } from "../../model/Appointment";
import { Id } from "../../model/Id";
import { gqlClient } from "../../gqlClient";

export const getAppointment = async (appointmentId: Id): Promise<Maybe<Appointment>> => {

    const query = gql`
        query getAppointment($appointmentId: ID!) {
            appointment(id: $appointmentId) {
                ${graphQlBody}
            }
        }
    `
    const variables = { appointmentId }

    try {
        const { appointment } = await gqlClient().request<{appointment: Appointment }>(query, variables)

        if (typeof(appointment) === 'undefined' || Object.is(appointment, null)) return new Promise((resolve) => resolve(undefined))

        return new Promise((resolve) => resolve(typeof(appointment) === 'undefined' || Object.is(appointment, null) ? undefined : appointment))

    } catch (error) {
        console.error(`Unable to get Boulevard appointment with Id: ${appointmentId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}