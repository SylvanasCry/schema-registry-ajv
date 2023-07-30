import { ValidateFunction } from 'ajv';
import { AjvInstance, SchemaRegistryAjvInstance } from './schema-registry-ajv-builder.types';
export declare class SchemaRegistryAjv {
    private readonly ajv;
    private readonly validate;
    constructor(ajv: AjvInstance, validate: ValidateFunction);
    addSchema(...args: Parameters<SchemaRegistryAjvInstance['addSchema']>): any;
    compile(...args: Parameters<SchemaRegistryAjvInstance['compile']>): ValidateFunction;
}
