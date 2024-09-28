import { PodiumOAuthScope } from "../model/OAuthScope"

export default [
    PodiumOAuthScope.ReadContacts,
    PodiumOAuthScope.WriteContacts,
    PodiumOAuthScope.ReadLocations,
    PodiumOAuthScope.ReadMessages,
    PodiumOAuthScope.ReadOrganizations,
    PodiumOAuthScope.ReadUsers,
    PodiumOAuthScope.WriteMessage,
] as PodiumOAuthScope[]