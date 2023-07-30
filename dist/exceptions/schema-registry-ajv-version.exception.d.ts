export declare class SchemaRegistryAjvVersionException extends Error {
    readonly subject: string;
    readonly reason: string;
    constructor(subject: string, reason: string);
}
