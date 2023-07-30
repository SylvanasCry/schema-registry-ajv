import * as all from '.';

describe('Library index', () => {
  it('should export user-level literals', () => {
    expect(all).toEqual({
      SchemaRegistryAjvSchemaException: expect.any(Function),
      SchemaRegistryAjvVersionException: expect.any(Function),
      SchemaRegistryAjv: expect.any(Function),
      SchemaRegistryAjvWrapper: expect.any(Function),
    });
  });
});
