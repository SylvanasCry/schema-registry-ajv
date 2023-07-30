"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryAjvVersionException = void 0;
class SchemaRegistryAjvVersionException extends Error {
    subject;
    reason;
    constructor(subject, reason) {
        super(`Failed to get the latest schema version (subject="${subject}" reason="${reason}")`);
        this.subject = subject;
        this.reason = reason;
    }
}
exports.SchemaRegistryAjvVersionException = SchemaRegistryAjvVersionException;
//# sourceMappingURL=schema-registry-ajv-version.exception.js.map