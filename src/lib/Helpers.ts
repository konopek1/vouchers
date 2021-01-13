export function areArraysEqual(a: Array<any> | Uint8Array, b: Array<any> | Uint8Array): boolean {
    return a.every((value: any, i: number) => value === b[i]);
}