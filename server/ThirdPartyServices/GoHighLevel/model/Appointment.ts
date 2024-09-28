export type Appointment = {
    id: string,
    calendarId: string,
    status: string,
    title: string,
    appoinmentStatus: string, // That typo is intentional apparently...
    assignedUserId: string,
    notes: string,
    startTime: string,
    endTime: string
}