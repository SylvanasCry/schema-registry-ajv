import { SchemaRegistryAjvBuilderBuildReturn, SchemaRegistryAjvBuilderOptions } from './schema-registry-ajv-builder.types';
export declare class SchemaRegistryAjvBuilder {
    /**
     * Builder options.
     */
    private readonly options;
    /**
     * To handle validation errors.
     *
     * @example console.log(builder.getErrors());
     */
    private validate;
    /**
     * To handle schema id.
     *
     * @example await this.schemaRegistry.encode(builder.getSchemaId(), event)
     * @param options
     */
    private schemaId;
    constructor(options: SchemaRegistryAjvBuilderOptions);
    build(): Promise<SchemaRegistryAjvBuilderBuildReturn>;
    /**
     * Returns schema id.
     */
    getSchemaId(): number;
    private getSchema;
    private getLatestVersion;
    private getVersionsUri;
    private getSchemaUri;
}
