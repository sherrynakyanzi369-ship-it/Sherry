"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDbService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let JsonDbService = class JsonDbService {
    db;
    filePath = path.join(process.cwd(), 'data', 'db.json');
    writable = true;
    constructor() {
        try {
            fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        }
        catch {
            this.filePath = path.join('/tmp', 'sherriez', 'db.json');
            try {
                fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
            }
            catch {
                this.writable = false;
            }
        }
        if (this.writable && fs.existsSync(this.filePath)) {
            try {
                this.db = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            }
            catch {
                this.db = null;
            }
        }
        if (!this.db?.meta) {
            this.db = {
                meta: { seedVersion: 0, secret: crypto.randomBytes(32).toString('hex'), counters: {} },
                users: [],
                products: [],
                orders: [],
                coupons: [],
                reviews: [],
                banners: [],
                subscribers: [],
                messages: [],
            };
        }
    }
    get data() {
        return this.db;
    }
    save() {
        if (!this.writable)
            return;
        try {
            const tmp = `${this.filePath}.tmp`;
            fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
            fs.renameSync(tmp, this.filePath);
        }
        catch {
            this.writable = false;
        }
    }
    nextId(collection) {
        const counters = this.db.meta.counters;
        counters[collection] = (counters[collection] ?? 0) + 1;
        return counters[collection];
    }
};
exports.JsonDbService = JsonDbService;
exports.JsonDbService = JsonDbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JsonDbService);
//# sourceMappingURL=json-db.service.js.map