export class SchemaRegistryAjvSchemaException extends Error {
  constructor(
    public readonly subject: string,
    public readonly version: number,
    public readonly reason: string,
  ) {
    super(`Failed to get the schema (subject=${subject} version=${version} reason="${reason}")`);
  }
}
