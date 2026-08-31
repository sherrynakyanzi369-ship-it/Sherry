export declare function reqStr(v: unknown, field: string, min?: number, max?: number): string;
export declare function optStr(v: unknown, max?: number): string | undefined;
export declare function reqEmail(v: unknown): string;
export declare function reqPhone(v: unknown): string;
export declare function reqNum(v: unknown, field: string, min: number, max: number): number;
export declare function reqEnum<T extends string>(v: unknown, field: string, allowed: readonly T[]): T;
export declare function validatePassword(pw: unknown): string;
