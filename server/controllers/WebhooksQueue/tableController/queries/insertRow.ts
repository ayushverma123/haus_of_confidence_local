import { Request, Response } from 'express'
import { ThirdPartyService } from '../../../../model/ThirdPartyService'
import { WebhookType } from '../../../WebhooksController/model/WebhookType'
import tableName from '../../constants/tableName'

export const insertRow = (
    type: WebhookType,
    service: ThirdPartyService,
    webhook_data: any,
    received_at: Date
) => ({
    text: `
    INSERT INTO ${tableName} (
        type, 
        service, 
        webhook_data, 
        received_at
    ) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`,
    values: [
        type, 
        service.toLowerCase(), 
        JSON.stringify(webhook_data), 
        received_at.toISOString()
    ]
})