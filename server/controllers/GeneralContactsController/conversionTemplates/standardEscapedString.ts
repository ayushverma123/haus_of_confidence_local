import { Maybe } from "../../../model/Maybe";
const escapeSpecialCharacters = (value) => value

export const standardEscapedString = (value: Maybe<string>): Maybe<string> => typeof(value) !== 'undefined' ? escapeSpecialCharacters(value) : undefined