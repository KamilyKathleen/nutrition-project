"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const app_1 = __importDefault(require("../src/app"));
exports.default = app_1.default;
const handler = (req, res) => {
    return (0, app_1.default)(req, res);
};
exports.handler = handler;
//# sourceMappingURL=index.js.map