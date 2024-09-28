export const standardKeyValueToValueArray = <T,>(value: {[key: string]: T}): T[] => 
    Object.keys(value).map((key) => value[key])