export enum OpportunityStatus {
    Open = 'open',
    Won = 'won',
    Lost = 'lost',
    Abandoned = 'abandoned',
    All = 'all',
}

export const OpportunityStatusFromString: {[status: string]: OpportunityStatus} = {
    'open': OpportunityStatus.Open,
    'won': OpportunityStatus.Won,
    'lost': OpportunityStatus.Lost,
    'abandoned': OpportunityStatus.Abandoned,
    'all': OpportunityStatus.All,
} 