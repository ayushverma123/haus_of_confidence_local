export enum StatusCodes {
    Continue = 100, 
    Switching_Protocol = 101, 
    Processing_WebDAV = 102, 
    Early_Hints = 103,

    OK = 200, 
    Created = 201, 
    Accepted = 202, 
    Non_Authoritative_Information = 203, 
    No_Content = 204, 
    Reset_Content = 205, 
    Partial_Content = 206, 
    Multi_Status_WebDAV = 207, 
    Already_Reported_WebDAV = 208, 
    IM_Used_HTTP_Delta_Encoding = 226,

    Multiple_Choice = 300,
    Moved_Permanently = 301, 
    Found = 302, 
    See_Other = 303, 
    Not_Modified = 304, 
    Use_Proxy = 305, 
    Temporary_Redirect = 307, 
    Permanent_Redirect = 308,

    Bad_Request = 400, 
    Unauthorized = 401, 
    Payment_Required = 402, 
    Forbidden = 403,
    Not_Found = 404, 
    Method_Not_Allowed = 405, 
    Not_Acceptable = 406, 
    Proxy_Authentication_Required = 407, 
    Request_Timeout = 408,
    Conflict = 409, 
    Gone = 410, 
    Length_Required = 411, 
    Precondition_Failed = 412, 
    Payload_Too_Large = 413, 
    URI_Too_Long = 414, 
    Unsupported_Media_Type = 415, 
    Range_Not_Satisfiable = 416, 
    Expectation_Failed = 417, 
    Im_A_Teapot = 418, 
    Misdirected_Request = 421, 
    Unprocessable_Entity_WebDAV = 422, 
    Locked_WebDAV = 423, 
    Failed_Dependency_WebDAV = 424, 
    Too_Early = 425, 
    Upgrade_Required = 426, 
    Precondition_Required = 428, 
    Too_Many_Requests = 429, 
    Request_Header_Fields_Too_Large = 431, 
    Unavailable_For_Legal_Reasons = 451,

    Internal_Server_Error = 500, 
    Not_Implemented = 501, Bad_Gateway = 502, Service_Unavailable = 503, Gateway_Timeout = 504, HTTP_Version_Not_Supported = 505, 
    Variant_Also_Negotiates = 506, 
    Insufficient_Storage_WebDAV = 507, 
    Loop_Detected_WebDAV = 508, 
    Not_Extended = 510, 
    Network_Authentication_Required = 511
}

export const StatusCodeTitleMap: ReadonlyMap<StatusCodes, String> = new Map([
    // 100s
    [StatusCodes.Continue, "Continue"],
    [StatusCodes.Switching_Protocol, "Switching Protocol"],
    [StatusCodes.Processing_WebDAV, "Processing (WebDAV)"],
    [StatusCodes.Early_Hints, "Early Hints"],
    // 200s
    [StatusCodes.OK, "OK"],
    [StatusCodes.Created, "Created"],
    [StatusCodes.Accepted, "Accepted"],
    [StatusCodes.Non_Authoritative_Information, "Non-Authoritative Information"],
    [StatusCodes.No_Content, "No Content"],
    [StatusCodes.Reset_Content, "Reset Content"],
    [StatusCodes.Partial_Content, "Partial Content"],
    [StatusCodes.Multi_Status_WebDAV, "Multi-Status (WebDAV)"],
    [StatusCodes.Already_Reported_WebDAV, "Already Reported (WebDAV)"],
    [StatusCodes.IM_Used_HTTP_Delta_Encoding, "IM Used (HTTP Delta Encoding)"],
    // 300s
    [StatusCodes.Multiple_Choice, "Multiple Choice"],
    [StatusCodes.Moved_Permanently, "Moved Permanently"],
    [StatusCodes.Found, "Found"],
    [StatusCodes.See_Other, "See Other"],
    [StatusCodes.Not_Modified, "Not Modified"],
    [StatusCodes.Use_Proxy, "Use Proxy"],
    [StatusCodes.Temporary_Redirect, "Temporary Redirect"],
    [StatusCodes.Permanent_Redirect, "Permanent Redirect"],
    // 400s
    [StatusCodes.Bad_Request, "Bad Request"],
    [StatusCodes.Unauthorized, "Unauthorized"],
    [StatusCodes.Payment_Required, "Payment Required"],
    [StatusCodes.Forbidden, "Forbidden"],
    [StatusCodes.Not_Found, "Not Found"],
    [StatusCodes.Method_Not_Allowed, "Method Not Allowed"],
    [StatusCodes.Not_Acceptable, "Not Acceptable"],
    [StatusCodes.Proxy_Authentication_Required, "Proxy Authentication Required"],
    [StatusCodes.Request_Timeout, "Request Timeout"],
    [StatusCodes.Conflict, "Conflict"],
    [StatusCodes.Gone, "Gone"],
    [StatusCodes.Length_Required, "Length Required"],
    [StatusCodes.Precondition_Failed, "Precondition Failed"],
    [StatusCodes.Payload_Too_Large, "Payload Too Large"],
    [StatusCodes.URI_Too_Long, "URI Too Long"],
    [StatusCodes.Unsupported_Media_Type, "Unsupported Media Type"],
    [StatusCodes.Range_Not_Satisfiable, "Range Not Satisfiable"],
    [StatusCodes.Expectation_Failed, "Expectation Failed"],
    [StatusCodes.Im_A_Teapot, "I'm a teapot"],
    [StatusCodes.Misdirected_Request, "Misdirected Request"],
    [StatusCodes.Unprocessable_Entity_WebDAV, "Unprocessable Entity (WebDAV)"],
    [StatusCodes.Locked_WebDAV, "Locked (WebDAV)"],
    [StatusCodes.Failed_Dependency_WebDAV, "Failed Dependency (WebDAV)"],
    [StatusCodes.Too_Early, "Too Early"],
    [StatusCodes.Upgrade_Required, "Upgrade Required"],
    [StatusCodes.Precondition_Required, "Precondition Required"],
    [StatusCodes.Too_Many_Requests, "Too Many Requests"],
    [StatusCodes.Request_Header_Fields_Too_Large, "Request Header Fields Too Large"],
    [StatusCodes.Unavailable_For_Legal_Reasons, "Unavailable for Legal Reasons"],
    // 500s
    //    _500, _501, _502, _503, _504, _505, _506, _507, _508, _510, _511
    [StatusCodes.Internal_Server_Error, "Internal Server Error"],
    [StatusCodes.Not_Implemented, "Not Implemented"],
    [StatusCodes.Bad_Gateway, "Bad Gateway"],
    [StatusCodes.Service_Unavailable, "Service Unavailable"],
    [StatusCodes.Gateway_Timeout, "Gateway Timeout"],
    [StatusCodes.HTTP_Version_Not_Supported, "HTTP Version Not Supported"],
    [StatusCodes.Variant_Also_Negotiates, "Variant Also Negotiates"],
    [StatusCodes.Insufficient_Storage_WebDAV, "Insufficient Storage (WebDAV)"],
    [StatusCodes.Loop_Detected_WebDAV, "Loop Detected (WebDAV)"],
    [StatusCodes.Not_Extended, "Not Extended"],
    [StatusCodes.Network_Authentication_Required, "Network Authentication Required"],
])

export type ErrorResponse = {
    errorCode?: string, 
    errorMessage: string
}

// TODO
export const respondWithStatusCode =  <T, >(res, statusCode: StatusCodes, response?: T) => 
    res.status(statusCode).send(response ?? "")

// TODO 
export const unauthorizedResponse = <T, >(res, response?: T) => 
    respondWithStatusCode(res, StatusCodes.Unauthorized, response ?? "")
    // res.status(StatusCodes._401).send(message)

export const respondWithError =  <T, >(res, statusCode: StatusCodes, error: ErrorResponse) => 
    res.status(statusCode).send({ errorCode: error.errorCode, errorMessage: error.errorMessage })    