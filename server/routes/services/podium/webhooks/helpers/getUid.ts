export const getUid = (data) => {
    // console.log("DATA!")
    // console.log(data)
    const before = data.before
    const after = data.after

    if (typeof(before) !== 'undefined' && !Object.is(before, null)) {
        if (typeof(before.uid) !== 'undefined' && !Object.is(before.uid, null)) {
            return before.uid
        }
    }

    if (typeof(after) !== 'undefined' && !Object.is(after, null)) {
        if (typeof(after.uid) !== 'undefined' && !Object.is(after.uid, null)) {
            return after.uid
        }
    }

    throw new Error(`Could not find uid in ${data}`)
}
