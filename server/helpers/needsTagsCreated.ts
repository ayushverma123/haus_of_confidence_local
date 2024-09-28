export const needsTagsCreated = (tags, tagsWithNoId) => {
    if (typeof(tags) !== 'undefined') {
        if (tagsWithNoId.length > 0) return true
        return false
    }
    return false
}