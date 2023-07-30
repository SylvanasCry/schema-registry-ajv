// noinspection JSUnusedLocalSymbols

import { ValidateFunction } from 'ajv';
import { AjvInstance, SchemaRegistryAjvInstance } from './schema-registry-ajv-builder.types';

export class SchemaRegistryAjv {
  constructor(
    private readonly ajv: AjvInstance,
    private readonly validate: ValidateFunction,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addSchema(...args: Parameters<SchemaRegistryAjvInstance['addSchema']>): any {
    return this.ajv;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public compile(...args: Parameters<SchemaRegistryAjvInstance['compile']>): ValidateFunction {
    return this.validate;
  }
}
