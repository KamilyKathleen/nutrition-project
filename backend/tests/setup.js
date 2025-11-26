"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose_1.default.connect(mongoUri);
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '1h';
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
afterEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        if (collection) {
            await collection.deleteMany({});
        }
    }
});
jest.setTimeout(30000);
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
//# sourceMappingURL=setup.js.map