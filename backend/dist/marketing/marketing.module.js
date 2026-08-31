"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingModule = void 0;
const common_1 = require("@nestjs/common");
const marketing_controller_1 = require("./marketing.controller");
const marketing_service_1 = require("./marketing.service");
const testimonials_controller_1 = require("./testimonials.controller");
const testimonials_service_1 = require("./testimonials.service");
const storefront_controller_1 = require("./storefront.controller");
const storefront_service_1 = require("./storefront.service");
let MarketingModule = class MarketingModule {
};
exports.MarketingModule = MarketingModule;
exports.MarketingModule = MarketingModule = __decorate([
    (0, common_1.Module)({
        controllers: [marketing_controller_1.MarketingController, testimonials_controller_1.TestimonialsController, storefront_controller_1.StorefrontController],
        providers: [marketing_service_1.MarketingService, testimonials_service_1.TestimonialsService, storefront_service_1.StorefrontService],
        exports: [marketing_service_1.MarketingService, testimonials_service_1.TestimonialsService],
    })
], MarketingModule);
//# sourceMappingURL=marketing.module.js.map