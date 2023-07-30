import { AnySchema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import axios from 'axios';
import { SchemaRegistryAjvSchemaException, SchemaRegistryAjvVersionException } from './exceptions';
import { SchemaRegistryAjv } from './schema-registry-ajv';
import { BuildReturnType, SchemaRegistryAjvBuilderOptions } from './schema-registry-ajv-builder.types';

export class SchemaRegistryAjvBuilder {
  /**
   * Builder options.
   */
  private readonly options: SchemaRegistryAjvBuilderOptions;

  /**
   * To handle validation errors.
   *
   * @example console.log(builder.getErrors());
   */
  private validate: ValidateFunction;

  /**
   * To handle schema id.
   *
   * @example await this.schemaRegistry.encode(builder.getSchemaId(), event)
   * @param options
   */
  private schemaId: number;

  constructor(options: SchemaRegistryAjvBuilderOptions) {
    // Remove trailing slash from SchemaRegistry host
    this.options = {
      ...options,
      schemaRegistry: {
        ...options.schemaRegistry,
        host: options.schemaRegistry.host.replace(/\/$/, ''),
      },
    };
  }

  public async build(): Promise<BuildReturnType> {
    const { ajvClass, ajvFormats, schemaRegistry } = this.options;
    const version = typeof schemaRegistry.version === 'number'
      ? schemaRegistry.version
      : await this.getLatestVersion();
    const schema = await this.getSchema(version);
    const ajv = new ajvClass();

    if (typeof this.options.ajvFormats !== 'undefined') {
      addFormats(ajv, ajvFormats);
    }

    if (typeof this.options.ajvCustomFormats !== 'undefined') {
      for (const { name, format } of this.options.ajvCustomFormats) {
        ajv.addFormat(name, format);
      }
    }

    const validate = ajv.compile(schema);
    this.validate = validate;

    return {
      ajvInstance: new SchemaRegistryAjv(ajv, validate),
      getErrors: () => this.validate.errors,
      getSchemaId: () => this.schemaId,
    };
  }

  private async getSchema(version: number): Promise<AnySchema> {
    const uri = this.getSchemaUri(version);

    try {
      const { data: { schema: plain, id } } = await axios.get<{ schema: string; id: number; }>(uri);

      this.schemaId = id;

      return JSON.parse(plain);
    } catch (err) {
      throw new SchemaRegistryAjvSchemaException(
        this.options.schemaRegistry.subject,
        version,
        err.message,
      );
    }
  }

  private async getLatestVersion(): Promise<number> {
    const uri = this.getVersionsUri();
    try {
      const { data: versions } = await axios.get<number[]>(uri);

      if (!Array.isArray(versions) || !versions.length) {
        // noinspection ExceptionCaughtLocallyJS
        throw new SchemaRegistryAjvVersionException(
          this.options.schemaRegistry.subject,
          'Response data is broken',
        );
      }

      return versions.slice(-1)[0];
    } catch (err) {
      if (err instanceof SchemaRegistryAjvVersionException) {
        throw err;
      }
      throw new SchemaRegistryAjvVersionException(
        this.options.schemaRegistry.subject,
        err.message,
      );
    }
  }

  private getVersionsUri(): string {
    return this.options.schemaRegistry.host
      + '/subjects/'
      + this.options.schemaRegistry.subject
      + '/versions';
  }

  private getSchemaUri(version: number): string {
    return this.options.schemaRegistry.host
      + '/subjects/'
      + this.options.schemaRegistry.subject
      + '/versions/'
      + version.toString(10);
  }
}
