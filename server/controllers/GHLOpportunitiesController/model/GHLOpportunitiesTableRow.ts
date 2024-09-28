import { Contact } from "../../../ThirdPartyServices/GoHighLevel/model/Contact"
import { Opportunity } from "../../../ThirdPartyServices/GoHighLevel/model/Opportunity"
import { OpportunityStatus } from "../../../ThirdPartyServices/GoHighLevel/model/Opportunity/OpportunityStatus"
import { GeneralContact } from "../../../model/GeneralContact"

export type GHLOpportunitiesTableRow = {
    id: number,
    status: OpportunityStatus,
    opportunity: Opportunity,
    ghl_contact_id: string,
    contact: Contact,
    created_at: Date,
    updated_at: Date,
    general_contact_id: number
}