import { SortDirection } from '../../model/sortDirection'

export const cycleSortDirection = (sortDirection: SortDirection): SortDirection => {
    const nextDirection: {[key in SortDirection]: SortDirection} = {
        [SortDirection.Ascending]: SortDirection.None,
        [SortDirection.Descending]: SortDirection.Ascending,
        [SortDirection.None]: SortDirection.Descending
    }

    return nextDirection[sortDirection]
} 