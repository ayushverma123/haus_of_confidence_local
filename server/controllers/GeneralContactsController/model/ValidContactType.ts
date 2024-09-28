import { Client } from "../../../ThirdPartyServices/Blvd/model/Client";
import { Contact as PodiumContact } from "../../../ThirdPartyServices/Podium/model/Contact";
import { Contact as GHLContact } from "../../../ThirdPartyServices/GoHighLevel/model/Contact";

export type ValidContactType = PodiumContact | Client | GHLContact