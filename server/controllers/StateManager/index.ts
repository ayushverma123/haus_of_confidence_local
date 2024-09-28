import { Maybe } from "../../model/Maybe"

const db = require('../../db')
const table = 'state_store'

const queries = {
    createRow: (stateId: string) => ({
        text: `INSERT INTO ${table} (id, json_state) VALUES ($1, $2) RETURNING *`,
        values: [
            stateId,
            JSON.stringify({})
        ]

    }),
    getStateObject: (stateId: string) => `SELECT * FROM ${table} WHERE id = '${stateId}'`,
    updateStateObject: (stateId: string, newStateObject: any) => ({
        text: `UPDATE ${table} SET json_state = $1 WHERE id = $2 RETURNING *`,
        values: [
            JSON.stringify(newStateObject),
            stateId
        ]
    })
}

export const insertRow = async (stateId: string): Promise<boolean> => {
    try {
        await db.query(queries.createRow(stateId))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        return new Promise((_, reject) => reject(error))
    }
}

export const StateStore = <state_object_type>(stateId: string) => {
    const _stateId = stateId.toLowerCase()

    const getObject = async (): Promise<state_object_type> => {
        let stateObject

        // Try to get current state
        try {
            const { rows } = await db.query(queries.getStateObject(_stateId))

            if (rows.length <= 0) {
                await insertRow(_stateId)
                stateObject = {}
            } else {
                stateObject = rows[0].json_state
            }

        } catch (error) {

            console.error(`Error getting state object for ${_stateId}`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }

        return stateObject
    }

    return {
        getObject,
        getValue: async <T>(key: string): Promise<Maybe<T>> => {
            try {
                const stateObject = await getObject()

                if (typeof(stateObject) === 'undefined') {
                    await insertRow(_stateId)

                    return new Promise((resolve) => resolve(undefined))
                }

                return new Promise((resolve) => resolve(stateObject![key]))

            } catch (error) {
                console.error(`Error getting state object for ${_stateId} in ${table} table`)
                console.error(error)
    
                return new Promise((_, reject) => reject(error)) 
            }
        },

        modifyValue: async <T>(property: string, value: T): Promise<T> => {

            let oldStateObject

            // Try to get current state
            
            try {
                const { rows } = await db.query(queries.getStateObject(_stateId))

                if (rows.length <= 0) {
                    await insertRow(_stateId)
                    oldStateObject = {}
                } else {
                    oldStateObject = rows[0].json_state
                }

            } catch (error) {

                console.error(`Error getting state object for ${_stateId} in ${table} table`)
                console.error(error)

                return new Promise((_, reject) => reject(error))
            }

            try {
                const { rows } = await db.query(queries.updateStateObject(_stateId, {
                    ...oldStateObject,
                    [property]: value
                }))
                
                return new Promise((resolve) => resolve(rows[0][property]))
            } catch (error) {
                console.error("WHAT")
                return new Promise((_, reject) => reject(error))
            }
        }
    }
}
