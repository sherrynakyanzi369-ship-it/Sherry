"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbModule = exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("./json-db.service");
const seed_1 = require("./seed");
let SeedService = class SeedService {
    db;
    constructor(db) {
        this.db = db;
    }
    onApplicationBootstrap() {
        const { meta } = this.db.data;
        if (!this.db.data.products.length || meta.seedVersion !== 1) {
            (0, seed_1.seedDatabase)(this.db);
            this.db.data.meta.secret = meta.secret;
            Object.assign(this.db.data.meta.counters, meta.counters);
            this.db.save();
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], SeedService);
let DbModule = class DbModule {
};
exports.DbModule = DbModule;
exports.DbModule = DbModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [json_db_service_1.JsonDbService, SeedService],
        exports: [json_db_service_1.JsonDbService],
    })
], DbModule);
//# sourceMappingURL=db.module.js.map