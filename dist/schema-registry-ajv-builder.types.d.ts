import { JsonOptions } from '@kafkajs/confluent-schema-registry/dist/@types';
import Ajv, { Format, ValidateFunction } from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { FormatName, FormatOptions } from 'ajv-formats';
export type Ctor<T = any> = new (...args: any[]) => T;
export type AjvInstance = Ajv | Ajv2019 | Ajv2020;
export type SchemaRegistryAjvInstance = NonNullable<JsonOptions['ajvInstance']>;
export interface AjvCustomFormat {
    name: string;
    format: Format;
}
export type GetErrorsFunction = () => ValidateFunction['errors'];
export type SchemaRegistryAjvBuilderBuildReturn = [
    SchemaRegistryAjvInstance,
    GetErrorsFunction
];
export interface SchemaRegistryAjvBuilderSchemaRegistryOptions {
    /**
     * Schema Registry URI.
     **
     * @example https://schema-registry.example.com
     * @example http://localhost:8081
     * @example http://localhost:8081/
     */
    readonly host: string;
    /**
     * Schema subject.
     *
     * @example product-name.service-name.entity-name.event.event-name.version-value
     * @example foo.bar.baz.event.baz-done.v0-value
     */
    readonly subject: string;
    /**
     * Subject version. Use 'latest' to get latest version. Default 'latest'.
     *
     * @example 3
     * @example 'latest'
     */
    readonly version?: number | 'latest';
}
export interface SchemaRegistryAjvBuilderOptions {
    /**
     * Ajv class you want to use. Check "$schema" attribute of your schemas.
     */
    readonly ajvClass: Ctor<AjvInstance>;
    /**
     * Ajv native format options.
     *
     * @example ['uuid', 'date-time']
     */
    readonly ajvFormats?: FormatName[] | FormatOptions;
    /**
     * Ajv custom format options.
     *
     * @example [{ name: 'custom-format', format: (value) => !!value }]
     */
    readonly ajvCustomFormats?: AjvCustomFormat[];
    /**
     * SchemaRegistry options.
     */
    readonly schemaRegistry: SchemaRegistryAjvBuilderSchemaRegistryOptions;
}
