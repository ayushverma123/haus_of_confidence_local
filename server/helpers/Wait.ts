export const Wait = async (waitTimeInMs: number): Promise<void> => 
    new Promise((resolve) => setTimeout(() => resolve(), waitTimeInMs))