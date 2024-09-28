export type DndSettings = {[key in DndSettingsType]: DndSettingsEntry}

export type DndSettingsEntry = {
    status: DndSettingsStatus,
    message: string,
    code: string
}

export enum DndSettingsType {
    Call = "Call",
    Email = "Email",
    SMS = "SMS",
    WhatsApp = "WhatsApp",
    GMB = "GMB",
    FB = "FB",
}

export enum DndSettingsStatus {
    Active = "active",
    Inactive = "inactive",
    Permanent = "permanent",
}
