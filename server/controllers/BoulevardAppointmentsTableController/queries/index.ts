import { Appointment } from '../../../ThirdPartyServices/Blvd/model/Appointment'
import { AppointmentState } from '../../../ThirdPartyServices/Blvd/model/Appointment/AppointmentState'
import { BoulevardAppointmentsTableRow } from '../model/BoulevardAppointmentsTableRow'

const table = 'boulevard_appointments'

export const queries = {
    insertRow: (contactId: number, appointmentId: string, appointmentObject: Appointment) => {
        const { endAt, createdAt, cancelled, state } = appointmentObject
        
        const hasAppointmentTimePassed: boolean = (() => {
            const currentTime = new Date().valueOf()
            const endTime = new Date(endAt).valueOf()

            return currentTime >= endTime
        })()
        
        return {
            text: `
                INSERT INTO ${table} (
                    contact_id,
                    appointment_id,
                    appointment_object,
                    created_at,
                    updated_at,
                    cancelled,
                    active,
                    completed
                    ${hasAppointmentTimePassed ? ', completed_at' : ''}
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ${hasAppointmentTimePassed ? ', $9' : ''})
                RETURNING *;
            `,
            values: [
                typeof(contactId) === 'number' ? contactId : typeof(contactId) ==='string' ? parseInt(contactId) : undefined, 
                appointmentId, 
                JSON.stringify(appointmentObject),
                createdAt || new Date().toISOString(),
                createdAt || new Date().toISOString(),
                cancelled || false,
                // isAppointmentBetweenStartAndEndTime,
                state === AppointmentState.ACTIVE,
                hasAppointmentTimePassed,
                ...(hasAppointmentTimePassed ? [endAt] : [])
            ] 
                
                // hasAppointmentTimePassed ? new Date().toISOString() : undefined
        
        }
    },

    updateAppointmentObject: (id: number, appointmentObject: Appointment) => ({
        text: `
            UPDATE ${table}
            SET appointment_object = $2, 
                updated_at = $3
            WHERE id = $1;
        `,
        values: [
            id, 
            JSON.stringify(appointmentObject),
            new Date().toISOString()
        ]
    }),

    updateCancelledValue: (id: number, cancelled: boolean) => ({
        text: `
            UPDATE ${table}
            SET cancelled = $2, 
                updated_at = $3,
                cancelled_at = $4
            WHERE id = $1;
        `,
        values: [
            id, 
            cancelled,
            new Date().toISOString(),
            cancelled ? new Date().toISOString() : undefined
        ]
    }),

    updateConfirmedValue: (id: number, confirmed: boolean) => ({
        text: `
            UPDATE ${table}
            SET confirmed = $2, 
                updated_at = $3,
                confirmed_at = $4
            WHERE id = $1;
        `  ,
        values: [
            id, 
            confirmed,
            new Date().toISOString(),
            confirmed ? new Date().toISOString() : undefined
        ]
    }),

    updateActiveValue: (id: number, active: boolean) => ({
        text: `
            UPDATE ${table}
            SET active = $2, 
                updated_at = $3
            WHERE id = $1;
        `  ,
        values: [
            id, 
            active,
            new Date().toISOString()
        ]
    }),

    updateCompletedValue: (id: number, completed: boolean) => ({
        text: `
            UPDATE ${table}
            SET completed = $2, 
                updated_at = $3,
                completed_at = $4
            WHERE id = $1;
        `  ,
        values: [
            id, 
            completed,
            new Date().toISOString(),
            completed ? new Date().toISOString() : undefined
        ]
    }),
    getAllAppointments: `
        SELECT * FROM ${table}
    ;`,

    getAllAppointmentsWithContactId: (contactId: number, excludeCancelled: boolean, onlyCompleted: boolean) => ({
        text: `
            SELECT * FROM ${table}
            WHERE contact_id = $1
            ${excludeCancelled ? `AND cancelled = false` : ''}
            ${onlyCompleted? `AND completed = true` : ''}
        ;`,
        values: [contactId]
    }),

    getRowWithAppointmentId: (appointmentId: string) => ({
        text: `
            SELECT * FROM ${table}
            WHERE appointment_id = $1
        ;`,
        values: [appointmentId]
    }),

    getRowWithContactIdAndAppointmentId: (contactId: number, appointmentId: string) => ({
        text: `
            SELECT * FROM ${table}
            WHERE appointment_id = $1 AND contact_id = $2
        ;`,
        values: [appointmentId, contactId]
    }),

    getRowWithId: (id: number) => ({
        text: `
            SELECT * FROM ${table}
            WHERE id = $1
        ;`,
        values: [id]
    }),

    getAllCurrentAppointments:  `
        SELECT * FROM ${table}
        WHERE cancelled = false AND completed = false
        
    ;`,

    getAllConfirmedAppointments:  `
        SELECT * FROM ${table}
        WHERE confirmed = true 
            AND cancelled = false 
            AND completed = false
    ;`,


}