export const randomRange = (min: number, maxPlusOne: number): number => 
    Math.floor(Math.random() * (maxPlusOne - min) + min)