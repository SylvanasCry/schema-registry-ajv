# schema-registry-ajv

An [Ajv](https://www.npmjs.com/package/ajv) instance wrapper for [@kafkajs/confluent-schema-registry](https://www.npmjs.com/package/@kafkajs/confluent-schema-registry).

[![Coverage Status](https://coveralls.io/repos/github/SylvanasCry/schema-registry-ajv/badge.svg)](https://coveralls.io/github/SylvanasCry/schema-registry-ajv)

#### Description

The library is a wrapper for the `Ajv` instance, which is in turn used in conjunction with `@kafkajs/confluent-schema-registry`.

#### Key Features

- Resolves the `Ajv` "schema with id ... already exists" error that occurs at high RPS during communication with Kafka when using `@kafkajs/confluent-schema-registry`.
- Allows retrieval of `Ajv` validation errors for the payload data by pulling them up to the application level.
- Resolves the `TypeError` when passing an `Ajv` instance to the SchemaRegistry constructor options.

## Installation

Install the library:
```shell
npm install @sylvanas-cry/schema-registry-ajv
```

Install peer dependencies:
```shell
npm install \
  @kafkajs/confluent-schema-registry \
  ajv \
  ajv-formats \
  axios
```

## Usage

Constructing and initialization:

```typescript
const builder = new SchemaRegistryAjvBuilder({
  // Ajv class you want to use. Check "$schema" attribute of your schemas
  ajvClass: Ajv2020,
  // Optional Ajv native format options
  ajvFormats: ['date-time'],
  // Optional Ajv custom format options
  ajvCustomFormats: [{ name: 'custom-format', format: (value) => !!value }],
  // Schema Registry options
  schemaRegistry: {
    // Schema Registry URI
    host: 'https://schema-registry.example.com:8081',
    // Schema subject
    subject: 'foo.bar.baz.event.baz-done.v0-value',
    // Optional version of schema you want to use (can be number or 'latest')
    version: 'latest',
  },
});

const [ajvInstance, getErrors] = await builder.build();

const schemaRegistry = new SchemaRegistry({ 
  host: 'https://schema-registry.example.com:8081',
}, {
  [SchemaType.JSON]: {
    ajvInstance, // <-- put your new safe Ajv instance here
  },
});
```

Somewhere in your code:

```typescript
// Publishing to Kafka topic
try {
  // To encode Kafka message value
  const value = await schemaRegistry.encode(builder.getSchemaId(), event);

  // ...
} catch (err) {
  // To get Ajv validation errors
  const validationErorrs = getErrors();
  
  // ...
}
```

## Changes and Release Notes

[CHANGELOG.md](./CHANGELOG.md)

## License

[MIT](./LICENSE)
