export enum CreateOrUpdate { 
    Create = "Create", 
    Update = "Update"
}
export type CreateOrUpdateMap <T,> = {[key in CreateOrUpdate]: T}
