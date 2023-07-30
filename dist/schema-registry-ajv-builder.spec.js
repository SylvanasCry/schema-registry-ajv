"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const confluent_schema_registry_1 = require("@kafkajs/confluent-schema-registry");
const _2020_1 = __importDefault(require("ajv/dist/2020"));
const nock_1 = __importDefault(require("nock"));
const exceptions_1 = require("./exceptions");
const schema_registry_ajv_1 = require("./schema-registry-ajv");
const schema_registry_ajv_builder_1 = require("./schema-registry-ajv-builder");
describe('SchemaRegistryAjvBuilder', () => {
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
    const options = {
        ajvClass: _2020_1.default,
        ajvFormats: ['date-time'],
        ajvCustomFormats: [{ name: 'custom-format', format: () => true }],
        schemaRegistry: {
            subject,
            host,
            version: 'latest',
        },
    };
    afterEach(() => {
        nock_1.default.cleanAll();
    });
    function createVersionsScope(...args) {
        (0, nock_1.default)(host)
            .get(`/subjects/${subject}/versions`)
            .reply(...args);
    }
    function createSchemaScope(version, ...args) {
        (0, nock_1.default)(host)
            .get(`/subjects/${subject}/versions/${version.toString(10)}`)
            .reply(...args);
    }
    it('should create SchemaRegistryAjv instance', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1, 2, 3], headers);
        createSchemaScope(3, 200, schemaReply, headers);
        const [ajv] = await builder.build();
        expect(ajv).toBeInstanceOf(schema_registry_ajv_1.SchemaRegistryAjv);
        expect(ajv.addSchema(schema)).toBeInstanceOf(_2020_1.default);
        expect(typeof ajv.compile(schema)).toBe('function');
    });
    it('it should provide SchemaRegistry comfortable Ajv instance', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1, 2, 3], headers);
        createSchemaScope(3, 200, schemaReply, headers);
        const [ajv] = await builder.build();
        const schemaRegistry = new confluent_schema_registry_1.SchemaRegistry({
            host,
        }, { [confluent_schema_registry_1.SchemaType.JSON]: { ajvInstance: ajv } });
        expect(schemaRegistry).toBeInstanceOf(confluent_schema_registry_1.SchemaRegistry);
    });
    it('should return a specific schema id', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder({
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
        await builder.build();
        expect(builder.getSchemaId()).toBe(1);
    });
    it('should return a latest schema id', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1, 2, 3], headers);
        createSchemaScope(3, 200, schemaReply, headers);
        await builder.build();
        expect(builder.getSchemaId()).toBe(3);
    });
    it('should return a default latest schema id', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder({
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
        await builder.build();
        expect(builder.getSchemaId()).toBe(6);
    });
    it('should return validation errors', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1, 2, 3], headers);
        createSchemaScope(3, 200, schemaReply, headers);
        const [ajv, getErrors] = await builder.build();
        const validate = ajv.compile({});
        const isValid = validate({
            attribute: 'BROKEN',
            custom: 'value',
        });
        const errors = getErrors();
        expect(isValid).toBe(false);
        expect(errors).toBeInstanceOf(Array);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual(expect.objectContaining({
            keyword: 'format',
            params: { format: 'date-time' },
        }));
    });
    it('should throw SchemaRegistryAjvVersionException on broken versions', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, 'BROKEN', headers);
        createSchemaScope(3, 200, schemaReply, headers);
        await expect(builder.build())
            .rejects
            .toThrowError(exceptions_1.SchemaRegistryAjvVersionException);
    });
    it('should throw SchemaRegistryAjvSchemaException on broken schema', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1], headers);
        createSchemaScope(1, 200, 'BROKEN', headers);
        await expect(builder.build())
            .rejects
            .toThrowError(exceptions_1.SchemaRegistryAjvSchemaException);
    });
    it('should throw SchemaRegistryAjvVersionException on AxiosError on versions request', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(400, [1], headers);
        createSchemaScope(1, 200, schemaReply, headers);
        await expect(builder.build())
            .rejects
            .toThrowError(exceptions_1.SchemaRegistryAjvVersionException);
    });
    it('should throw SchemaRegistryAjvSchemaException on AxiosError on schema request', async () => {
        const builder = new schema_registry_ajv_builder_1.SchemaRegistryAjvBuilder(options);
        createVersionsScope(200, [1], headers);
        createSchemaScope(1, 502, schemaReply, headers);
        await expect(builder.build())
            .rejects
            .toThrowError(exceptions_1.SchemaRegistryAjvSchemaException);
    });
});
//# sourceMappingURL=schema-registry-ajv-builder.spec.js.map