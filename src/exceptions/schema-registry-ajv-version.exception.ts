export class SchemaRegistryAjvVersionException extends Error {
  constructor(
    public readonly subject: string,
    public readonly reason: string,
  ) {
    super(`Failed to get the latest schema version (subject=${subject} reason="${reason}")`);
  }
}
