import { Maybe } from "graphql/jsutils/Maybe";

export const standardArrayToSingleValue = <T,> (values: T[]): Maybe<T> => values[0] ?? undefined