import { WebhookType, WebhookTypeMap } from "../WebhookType";

export const eventTypeEnumToBoulevardName: WebhookTypeMap<string> = {
    [WebhookType.ContactCreated]: "CLIENT_CREATED",
    [WebhookType.ContactDeleted]: "CLIENT_DELETED",
    [WebhookType.ContactMerged]: "CLIENT_MERGED",
    [WebhookType.ContactUpdated]: "CLIENT_UPDATED",
    [WebhookType.OpportunityCreated]: "OPPORTUNITY_CREATED", //! DOES NOT EXIST
    [WebhookType.OpportunityDeleted]: "OPPORTUNITY_DELETED", //! DOES NOT EXIST
    [WebhookType.OpportunityStatusUpdate]: '', //! DOES NOT EXIST
    [WebhookType.OpportunityAssignedToUpdate]: '', //! DOES NOT EXIST
    [WebhookType.OpportunityMonetaryValueUpdate] : '', //! DOES NOT EXIST
    [WebhookType.OpportunityStageUpdate] : '', //! DOES NOT EXIST
    [WebhookType.AppointmentCreated]: "APPOINTMENT_CREATED",
    [WebhookType.AppointmentUpdated]: "APPOINTMENT_UPDATED",
    [WebhookType.AppointmentCancelled]: "APPOINTMENT_CANCELLED",
    [WebhookType.AppointmentCompleted]: "APPOINTMENT_COMPLETED",
    [WebhookType.AppointmentRescheduled]: "APPOINTMENT_RESCHEDULED",
    [WebhookType.AppointmentActive]: "APPOINTMENT_ACTIVE",
    [WebhookType.AppointmentConfirmed]: "APPOINTMENT_CONFIRMED",
    [WebhookType.AppointmentArrived]: "APPOINTMENT_ARRIVED",
    [WebhookType.MessageFailed]: "MESSAGE_FAILED", //! DOES NOT EXIST
    [WebhookType.MessageSent]: "MESSAGE_SENT", //! DOES NOT EXIST
    
}