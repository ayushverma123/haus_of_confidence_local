import { GoHighLevelOAuthScopes } from "../model/GoHighLevelOAuthScopes";

export const scopesInUse: GoHighLevelOAuthScopes[] = [
    GoHighLevelOAuthScopes["businesses.readonly"],
    // GoHighLevelOAuthScopes["calendars.readonly"],
    // GoHighLevelOAuthScopes["calendars/events.readonly"],
    // GoHighLevelOAuthScopes["campaigns.readonly"],
    GoHighLevelOAuthScopes["contacts.readonly"],
    // GoHighLevelOAuthScopes["conversations.readonly"],
    // GoHighLevelOAuthScopes["conversations/messages.readonly"],
    // GoHighLevelOAuthScopes["forms.readonly"],
    // GoHighLevelOAuthScopes["links.readonly"],
    GoHighLevelOAuthScopes["locations.readonly"],
    // GoHighLevelOAuthScopes["locations/customValues.readonly"],
    // GoHighLevelOAuthScopes["locations/customFields.readonly"],
    // GoHighLevelOAuthScopes["locations/tags.readonly"],
    // GoHighLevelOAuthScopes["locations/templates.readonly"],
    // GoHighLevelOAuthScopes["locations/tasks.readonly"],
    // GoHighLevelOAuthScopes["medias.readonly"],
    GoHighLevelOAuthScopes["opportunities.readonly"],
    GoHighLevelOAuthScopes["opportunities.write"],
    // GoHighLevelOAuthScopes["oauth.readonly"],
]