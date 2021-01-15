export function areArraysEqual(a: Array<any> | Uint8Array, b: Array<any> | Uint8Array): boolean {
    return a.every((value: any, i: number) => value === b[i]);
}

export function encodeCompiledTeal(tealProgram: string) {
    return Uint8Array.from(Buffer.from(tealProgram, "base64"));
}

export function jsonEncodedUint8ArrayToUint8Array(jsonUint8Array: Object) {
    const arr = new Uint8Array(Object.keys(jsonUint8Array).length);

    Object.entries(jsonUint8Array).map(([key, value]) => {
        arr[Number(key)] = value;
    });

    return arr;
}