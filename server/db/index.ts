import { checkEnvBooleanValue } from "../helpers/envFunctions"

require('dotenv').config()

const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: checkEnvBooleanValue(process.env.HEROKU) ? {
        rejectUnauthorized: false 
    } : undefined
    
})

export const query = async <T, >(queryString: string, params: any[]): Promise<T> => {
    try {
        const results = await pool.query(queryString, params)
        return new Promise<T>((resolve, _) => resolve(results))
    }
    catch (error) {
        return new Promise<T>((_, reject) => reject(error))
    }
}