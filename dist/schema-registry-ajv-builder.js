"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryAjvBuilder = void 0;
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const axios_1 = __importDefault(require("axios"));
const exceptions_1 = require("./exceptions");
const schema_registry_ajv_1 = require("./schema-registry-ajv");
class SchemaRegistryAjvBuilder {
    /**
     * Builder options.
     */
    options;
    /**
     * To handle validation errors.
     *
     * @example console.log(builder.getErrors());
     */
    validate;
    /**
     * To handle schema id.
     *
     * @example await this.schemaRegistry.encode(builder.getSchemaId(), event)
     * @param options
     */
    schemaId;
    constructor(options) {
        // Remove trailing slash from SchemaRegistry host
        this.options = {
            ...options,
            schemaRegistry: {
                ...options.schemaRegistry,
                host: options.schemaRegistry.host.replace(/\/$/, ''),
            },
        };
    }
    async build() {
        const { ajvClass, ajvFormats, schemaRegistry } = this.options;
        const version = typeof schemaRegistry.version === 'number'
            ? schemaRegistry.version
            : await this.getLatestVersion();
        const schema = await this.getSchema(version);
        const ajv = new ajvClass();
        if (typeof this.options.ajvFormats !== 'undefined') {
            (0, ajv_formats_1.default)(ajv, ajvFormats);
        }
        if (typeof this.options.ajvCustomFormats !== 'undefined') {
            for (const { name, format } of this.options.ajvCustomFormats) {
                ajv.addFormat(name, format);
            }
        }
        const validate = ajv.compile(schema);
        this.validate = validate;
        return [
            new schema_registry_ajv_1.SchemaRegistryAjv(ajv, validate),
            () => this.validate.errors,
        ];
    }
    /**
     * Returns schema id.
     */
    getSchemaId() {
        return this.schemaId;
    }
    async getSchema(version) {
        const uri = this.getSchemaUri(version);
        try {
            const { data: { schema: plain, id } } = await axios_1.default.get(uri);
            this.schemaId = id;
            return JSON.parse(plain);
        }
        catch (err) {
            throw new exceptions_1.SchemaRegistryAjvSchemaException(this.options.schemaRegistry.subject, version, err.message);
        }
    }
    async getLatestVersion() {
        const uri = this.getVersionsUri();
        try {
            const { data: versions } = await axios_1.default.get(uri);
            if (!Array.isArray(versions) || !versions.length) {
                // noinspection ExceptionCaughtLocallyJS
                throw new exceptions_1.SchemaRegistryAjvVersionException(this.options.schemaRegistry.subject, 'Response data is broken');
            }
            return versions.slice(-1)[0];
        }
        catch (err) {
            if (err instanceof exceptions_1.SchemaRegistryAjvVersionException) {
                throw err;
            }
            throw new exceptions_1.SchemaRegistryAjvVersionException(this.options.schemaRegistry.subject, err.message);
        }
    }
    getVersionsUri() {
        return this.options.schemaRegistry.host
            + '/subjects/'
            + this.options.schemaRegistry.subject
            + '/versions';
    }
    getSchemaUri(version) {
        return this.options.schemaRegistry.host
            + '/subjects/'
            + this.options.schemaRegistry.subject
            + '/versions/'
            + version.toString(10);
    }
}
exports.SchemaRegistryAjvBuilder = SchemaRegistryAjvBuilder;
//# sourceMappingURL=schema-registry-ajv-builder.js.map