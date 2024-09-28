import { getYear, getMonth, getDate } from 'date-fns'
import addLeadingZero from '../../../helpers/addLeadingZero'
import { Maybe } from '../../../model/Maybe'

const convertDateToBoulevardDateOfBirthValue = (date: Maybe<Date> ): Maybe<string> => {
    if (typeof(date) === 'undefined' || Object.is(date, null)) {
        return undefined
    }

    const [year, month, day] = [
        addLeadingZero(getYear(date!)), 
        addLeadingZero(getMonth(date!) + 1), 
        addLeadingZero(getDate(date!))
    ]

    return `${year}-${month}-${day}`
}

export default convertDateToBoulevardDateOfBirthValue