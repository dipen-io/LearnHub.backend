//from the response removing filtering out all undefined or null

export function cleanNullUndefined(obj: Record<string, any>){
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    );
}
