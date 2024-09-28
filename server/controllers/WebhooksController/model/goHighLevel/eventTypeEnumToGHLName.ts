import { WebhookType, WebhookTypeMap } from "../WebhookType";

export const eventTypeEnumToGHLName: WebhookTypeMap<string> = {
    [WebhookType.ContactCreated]: "ContactCreated", //! DOES NOT EXIST
    [WebhookType.ContactUpdated]: "ContactUpdated", //! DOESN'T EXIST
    [WebhookType.ContactDeleted]: "ContactDeleted",
    [WebhookType.ContactMerged]: "ContactMerged", //! DOESN'T EXIST
    [WebhookType.AppointmentActive]: "AppointmentActive", //! DOESN'T EXIST
    [WebhookType.AppointmentConfirmed]: "AppointmentConfirmed", //! DOESN'T EXIST
    [WebhookType.AppointmentCompleted]: "AppointmentCompleted", //! DOESN'T EXIST
    [WebhookType.AppointmentCancelled]: "AppointmentCancelled", //! DOESN'T EXIST
    [WebhookType.AppointmentRescheduled]: "AppointmentRescheduled", //! DOESN'T EXIST
    [WebhookType.AppointmentArrived]: "AppointmentArrived", //! DOESN'T EXIST
    [WebhookType.AppointmentCreated]: "AppointmentCreate", //! DOESN'T EXIST
    [WebhookType.AppointmentUpdated]: "AppointmentUpdate", //! DOESN'T EXIST
    [WebhookType.MessageFailed]: "MessageFailed", //! DOESN'T EXIST
    [WebhookType.MessageSent]: "MessageSent", //! DOESN'T EXIST
    [WebhookType.OpportunityCreated]: "OpportunityCreated", 
    [WebhookType.OpportunityDeleted]: "OpportunityDeleted",
    [WebhookType.OpportunityStatusUpdate]: "OpportunityStatusUpdate",
    [WebhookType.OpportunityAssignedToUpdate]: "OpportunityAssignedToUpdate",
    [WebhookType.OpportunityMonetaryValueUpdate] : "OpportunityMonetaryValueUpdate",
    [WebhookType.OpportunityStageUpdate] : "OpportunityStageUpdate",

}