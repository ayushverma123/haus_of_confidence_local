export type SocketFunctionEntry = {
    request: string,
    response: string,
    errorResponse?: string,
    socketFunction: (input: any | undefined) => Promise<any>
}