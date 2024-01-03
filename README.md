# schema-registry-ajv

An [Ajv](https://www.npmjs.com/package/ajv) instance wrapper for [@kafkajs/confluent-schema-registry](https://www.npmjs.com/package/@kafkajs/confluent-schema-registry).

[![Coverage Status](https://coveralls.io/repos/github/SylvanasCry/schema-registry-ajv/badge.svg)](https://coveralls.io/github/SylvanasCry/schema-registry-ajv)
[![Tested with: Jest](https://img.shields.io/badge/tested_with-jest-4dc81f?logo=jest)](https://jestjs.io/)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![TypeScript 5.1.6](https://img.shields.io/badge/typescript-5.1.6-blue?logoColor=white)](https://www.typescriptlang.org/)
[![ECMAScript 2022](https://img.shields.io/badge/es-2022-orange?logoColor=white)](https://262.ecma-international.org/13.0/)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


#### Description

The library is a wrapper for the `Ajv` instance, which is in turn used in conjunction with `@kafkajs/confluent-schema-registry`.

#### Key Features

- Resolves the `Ajv` "schema with id ... already exists" error that occurs at high RPS during communication with Kafka when using `@kafkajs/confluent-schema-registry`.
- Allows retrieval of `Ajv` validation errors for the payload data by pulling them up to the application level.
- Resolves the `TypeError` when passing an `Ajv` instance to the SchemaRegistry constructor options.

#### Bonus Features

- Saves you from having to handle the schema ID.

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

const { ajvInstance, getSchemaId, getErrors } = await builder.build();

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
  const value = await schemaRegistry.encode(getSchemaId(), event);

  // ...
} catch (err) {
  // To get Ajv validation errors
  const validationErorrs = getErrors();

  // ...
}
```

## Changes and Release Notes

[CHANGELOG.md](https://github.com/SylvanasCry/schema-registry-ajv/blob/master/CHANGELOG.md)

## License

The scripts and documentation in this project are released under the [MIT License](./LICENSE).
