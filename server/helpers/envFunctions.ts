export const checkEnvBooleanValue = (envVar: any) => typeof(envVar) !== 'undefined' && envVar.toLowerCase() !== "false"
