export interface AutomatedMessageCustomIncludeExcludeConfigurationEntry <InclusionType extends {[key: string]: any}, ExtraOptionsType extends {[key: string]: any}> {
    use: boolean,
    includes: Array<InclusionType>,
    excludes: Array<InclusionType>,
    extraOptions?: ExtraOptionsType
}