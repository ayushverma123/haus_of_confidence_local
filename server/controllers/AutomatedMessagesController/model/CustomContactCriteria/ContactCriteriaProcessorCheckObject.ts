import { AutomatedMessageCustomContactCriteria } from "./AutomatedMessageCustomContactCriteriaConfiguration"

export type ContactCriteriaProcessorCheckObject = {[key in AutomatedMessageCustomContactCriteria]: {
    // use: boolean,
    hasRequiredData: boolean,
    // hasIncludes: boolean,
    // hasExcludes: boolean,
    includes: any[],
    excludes: any[]
}}