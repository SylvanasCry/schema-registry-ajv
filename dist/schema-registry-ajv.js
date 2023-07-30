"use strict";
// noinspection JSUnusedLocalSymbols
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryAjv = void 0;
class SchemaRegistryAjv {
    ajv;
    validate;
    constructor(ajv, validate) {
        this.ajv = ajv;
        this.validate = validate;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addSchema(...args) {
        return this.ajv;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compile(...args) {
        return this.validate;
    }
}
exports.SchemaRegistryAjv = SchemaRegistryAjv;
//# sourceMappingURL=schema-registry-ajv.js.map