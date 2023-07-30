export declare class SchemaRegistryAjvSchemaException extends Error {
    readonly subject: string;
    readonly version: number;
    readonly reason: string;
    constructor(subject: string, version: number, reason: string);
}
