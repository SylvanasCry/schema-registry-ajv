import { AnySchema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import axios from 'axios';
import { SchemaRegistryAjvSchemaException, SchemaRegistryAjvVersionException } from './exceptions';
import { SchemaRegistryAjv } from './schema-registry-ajv';
import { SchemaRegistryAjvInstance, SchemaRegistryAjvWrapperOptions } from './schema-registry-ajv-wrapper.types';

export class SchemaRegistryAjvWrapper {
  /**
   * Wrapper options.
   */
  private readonly options: SchemaRegistryAjvWrapperOptions;

  /**
   * To handle validation errors.
   *
   * @example console.log(wrapper.getErrors());
   */
  private validate: ValidateFunction;

  /**
   * To handle schema id.
   *
   * @example await this.schemaRegistry.encode(wrapper.getSchemaId(), event)
   * @param options
   */
  private schemaId: number;

  constructor(options: SchemaRegistryAjvWrapperOptions) {
    // Remove trailing slash from SchemaRegistry host
    this.options = {
      ...options,
      schemaRegistry: {
        ...options.schemaRegistry,
        host: options.schemaRegistry.host.replace(/\/$/, ''),
      },
    };
  }

  public async getInstance(): Promise<SchemaRegistryAjvInstance> {
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

    return new SchemaRegistryAjv(ajv, validate);
  }

  /**
   * Returns schema id.
   */
  public getSchemaId(): number {
    return this.schemaId;
  }

  /**
   * Returns Ajv validation errors array.
   */
  public getErrors(): ValidateFunction['errors'] {
    return this.validate.errors;
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
          'Response data broken',
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
