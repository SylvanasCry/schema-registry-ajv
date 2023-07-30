"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryAjvSchemaException = void 0;
class SchemaRegistryAjvSchemaException extends Error {
    subject;
    version;
    reason;
    constructor(subject, version, reason) {
        super(`Failed to get the schema (subject="${subject}" version=${version} reason="${reason}")`);
        this.subject = subject;
        this.version = version;
        this.reason = reason;
    }
}
exports.SchemaRegistryAjvSchemaException = SchemaRegistryAjvSchemaException;
//# sourceMappingURL=schema-registry-ajv-schema.exception.js.map