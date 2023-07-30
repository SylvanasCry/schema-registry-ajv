import { ValidateFunction } from 'ajv';
import { AjvInstance, SchemaRegistryAjvInstance } from './schema-registry-ajv-wrapper.types';

export class SchemaRegistryAjv {
  constructor(
    private readonly ajv: AjvInstance,
    private readonly validate: ValidateFunction,
  ) {}

  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addSchema(...args: Parameters<SchemaRegistryAjvInstance['addSchema']>): any {
    return this.ajv;
  }

  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public compile(...args: Parameters<SchemaRegistryAjvInstance['compile']>): ValidateFunction {
    return this.validate;
  }
}
