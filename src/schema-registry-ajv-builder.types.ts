import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { Format, ValidateFunction } from 'ajv';
import type AjvCore from 'ajv/dist/core';
import { FormatName, FormatOptions } from 'ajv-formats';

/**
 * @deprecated Not used by the library anymore; use {@link AjvClass} for `ajvClass`.
 */
export type Ctor<T = any> = new (...args: any[]) => T;

/**
 * Any Ajv flavor for JSON Schema (`Ajv`, `Ajv2019`, `Ajv2020`, ...): they all extend the Ajv core class.
 */
export type AjvInstance = AjvCore;

/**
 * Ajv class to instantiate, e.g. `Ajv`, `Ajv2019` or `Ajv2020`.
 */
export type AjvClass = new () => AjvInstance;

/**
 * Options of the `SchemaRegistry` constructor. Derived from its public signature,
 * since the library does not export its option types.
 */
type SchemaRegistryOptions = NonNullable<ConstructorParameters<typeof SchemaRegistry>[1]>;

type SchemaRegistryJsonOptions = NonNullable<
  Extract<SchemaRegistryOptions, { [SchemaType.JSON]?: unknown }>[SchemaType.JSON]
>;

export type SchemaRegistryAjvInstance = NonNullable<SchemaRegistryJsonOptions['ajvInstance']>;

export interface AjvCustomFormat {
  name: string;
  format: Format;
}

export type GetSchemaId = () => number;
export type GetErrors = () => ValidateFunction['errors'];

export interface BuildReturnType {
  /**
   * SchemaRegistry constructor compatible Ajv instance.
   *
   * @see SchemaRegistryAjvInstance
   */
  ajvInstance: SchemaRegistryAjvInstance;

  /**
   * Returns schema id.
   */
  getSchemaId: GetSchemaId;

  /**
   * Returns Ajv validation errors.
   */
  getErrors: GetErrors;
}

export interface SchemaRegistryAjvBuilderSchemaRegistryOptions {
  /**
   * Schema Registry URI.
   *
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
  readonly ajvClass: AjvClass;

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
