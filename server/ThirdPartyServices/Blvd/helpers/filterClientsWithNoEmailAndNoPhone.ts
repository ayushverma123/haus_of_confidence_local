export default (item) => {
    const { mobilePhone, email} = item
    const hasPhone = (() => {
        if (typeof(mobilePhone) === 'undefined' || Object.is(mobilePhone, null)) return false
        if (mobilePhone!.length <= 0) return false
        return true
    })()

    const hasEmail = (() => {
        if (typeof(email) === 'undefined' || Object.is(email, null)) return false
        if (email!.length <= 0) return false
        return true
    })()

    return hasPhone || hasEmail
}