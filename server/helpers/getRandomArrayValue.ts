import { randomRange } from "./RandomNumberGenerator";

export const getRandomArrayValue = <T,>(array: T[]): T => array[randomRange(0, array.length)]