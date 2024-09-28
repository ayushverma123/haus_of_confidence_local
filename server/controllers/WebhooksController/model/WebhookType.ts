export enum WebhookType {
    //#region Boulevard
    AppointmentCreated = "appointment.created",
    AppointmentUpdated = "appointment.updated",
    AppointmentCancelled = "appointment.cancelled",
    AppointmentCompleted = "appointment.completed",
    AppointmentRescheduled = "appointment.rescheduled",
    AppointmentActive = "appointment.active",
    AppointmentConfirmed = "appointment.confirmed",
    AppointmentArrived = "appointment.arrived",   
    //#endregion

    //#region Podium
    ContactCreated = "contact.created",
    ContactDeleted = "contact.deleted",
    ContactMerged = "contact.merged",
    ContactUpdated = "contact.updated",
    MessageFailed = "message.failed",
    MessageSent = "message.sent",
    //#endregion

    //#region GHL
    OpportunityCreated = "opportunity.created",
    OpportunityDeleted = "opportunity.deleted",
    OpportunityStatusUpdate = "opportunity.status.update",
    OpportunityAssignedToUpdate = "opportunity.assigned.to.update",
    OpportunityMonetaryValueUpdate = "opportunity.monetary.value.update",
    OpportunityStageUpdate = "opportunity.stage.update",
    //#endregion
} 

export type WebhookTypeMap<T,> = {[key in WebhookType]: T} 

export const webhookTypesStrings: string[] = Object.values(WebhookType)