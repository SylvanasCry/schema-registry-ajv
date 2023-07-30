import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import Ajv2020 from 'ajv/dist/2020';
import nock from 'nock';
import { SchemaRegistryAjvSchemaException, SchemaRegistryAjvVersionException } from './exceptions';
import { SchemaRegistryAjv } from './schema-registry-ajv';
import { SchemaRegistryAjvWrapper } from './schema-registry-ajv-wrapper';
import { SchemaRegistryAjvWrapperOptions } from './schema-registry-ajv-wrapper.types';

describe('SchemaRegistryAjvWrapper', () => {
  const subject = 'foo.bar.baz.event.baz-done.v0-value';
  const host = 'https://schema-registry.example.com';

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'schema.json',
    type: 'object',
    additionalProperties: false,
    required: [
      'attribute',
    ],
    properties: {
      attribute: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'schema-attribute.json',
        type: 'string',
        format: 'date-time',
      },
      custom: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'schema-custom.json',
        type: 'string',
        format: 'custom-format',
      },
    },
  };

  const schemaReply = {
    subject,
    version: 1,
    id: 3,
    schemaType: 'JSON',
    schema: JSON.stringify(schema),
  };

  const headers = { 'Content-Type': 'application/json' };

  const options: SchemaRegistryAjvWrapperOptions = {
    ajvClass: Ajv2020,
    ajvFormats: ['date-time'],
    ajvCustomFormats: [{ name: 'custom-format', format: () => true }],
    schemaRegistry: {
      subject,
      host,
      version: 'latest',
    },
  };

  afterAll(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function createVersionsScope(...args: Parameters<nock.Interceptor['reply']>): void {
    nock(host)
      // .persist()
      .get(`/subjects/${subject}/versions`)
      .reply(...args);
  }

  function createSchemaScope(version: number, ...args: Parameters<nock.Interceptor['reply']>): void {
    nock(host)
      // .persist()
      .get(`/subjects/${subject}/versions/${version.toString(10)}`)
      .reply(...args);
  }

  it('should create SchemaRegistryAjv instance', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1, 2, 3], headers);
    createSchemaScope(3, 200, schemaReply, headers);

    const ajv = await wrapper.getInstance();

    expect(ajv).toBeInstanceOf(SchemaRegistryAjv);
    expect(ajv.addSchema(schema)).toBeInstanceOf(Ajv2020);
    expect(typeof ajv.compile(schema)).toBe('function');
  });

  it('it should provide SchemaRegistry comfortable Ajv instance', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1, 2, 3], headers);
    createSchemaScope(3, 200, schemaReply, headers);

    const ajv = await wrapper.getInstance();
    const schemaRegistry = new SchemaRegistry({
      host,
    }, { [SchemaType.JSON]: { ajvInstance: ajv } });

    expect(schemaRegistry).toBeInstanceOf(SchemaRegistry);
  });

  it('should return a specific schema id', async () => {
    const wrapper = new SchemaRegistryAjvWrapper({
      ...options,
      schemaRegistry: {
        ...options.schemaRegistry,
        version: 1,
      },
    });

    createVersionsScope(200, [1, 2, 3], headers);
    createSchemaScope(1, 200, {
      ...schemaReply,
      id: 1,
    }, headers);

    await wrapper.getInstance();
    expect(wrapper.getSchemaId()).toBe(1);
  });

  it('should return a latest schema id', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1, 2, 3], headers);
    createSchemaScope(3, 200, schemaReply, headers);

    await wrapper.getInstance();
    expect(wrapper.getSchemaId()).toBe(3);
  });

  it('should return a default latest schema id', async () => {
    const wrapper = new SchemaRegistryAjvWrapper({
      ...options,
      schemaRegistry: {
        ...options.schemaRegistry,
        version: undefined,
      },
    });

    createVersionsScope(200, [1, 2, 3, 4, 5, 6], headers);
    createSchemaScope(6, 200, {
      ...schemaReply,
      id: 6,
    }, headers);

    await wrapper.getInstance();
    expect(wrapper.getSchemaId()).toBe(6);
  });

  it('should return validation errors', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1, 2, 3], headers);
    createSchemaScope(3, 200, schemaReply, headers);

    const ajv = await wrapper.getInstance();
    const validate = ajv.compile({});
    const isValid = validate({
      attribute: 'BROKEN',
      custom: 'value',
    });
    const errors = wrapper.getErrors();
    expect(isValid).toBe(false);
    expect(errors).toBeInstanceOf(Array);
    expect(errors!.length).toBe(1);
    expect(errors![0]).toEqual(expect.objectContaining({
      keyword: 'format',
      params: { format: 'date-time' },
    }));
  });

  it('should throw SchemaRegistryAjvVersionException on broken versions', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, 'BROKEN', headers);
    createSchemaScope(3, 200, schemaReply, headers);

    await expect(wrapper.getInstance())
      .rejects
      .toThrowError(SchemaRegistryAjvVersionException);
  });

  it('should throw SchemaRegistryAjvSchemaException on broken schema', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1], headers);
    createSchemaScope(1, 200, 'BROKEN', headers);

    await expect(wrapper.getInstance())
      .rejects
      .toThrowError(SchemaRegistryAjvSchemaException);
  });

  it('should throw SchemaRegistryAjvVersionException on AxiosError on versions request', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(400, [1], headers);
    createSchemaScope(1, 200, schemaReply, headers);

    await expect(wrapper.getInstance())
      .rejects
      .toThrowError(SchemaRegistryAjvVersionException);
  });

  it('should throw SchemaRegistryAjvSchemaException on AxiosError on schema request', async () => {
    const wrapper = new SchemaRegistryAjvWrapper(options);

    createVersionsScope(200, [1], headers);
    createSchemaScope(1, 502, schemaReply, headers);

    await expect(wrapper.getInstance())
      .rejects
      .toThrowError(SchemaRegistryAjvSchemaException);
  });
});
