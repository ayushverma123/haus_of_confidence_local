export type Task = {
    id: string,
    title: string,
    body: string,
    assignedTo: string,
    dueDate: string,
    completed: boolean,
    contactId: string
}