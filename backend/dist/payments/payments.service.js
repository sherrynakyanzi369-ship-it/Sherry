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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let PaymentsService = class PaymentsService {
    providers = {
        momo: (amount, details) => {
            const phone = String(details.phone ?? '');
            if (!/^[+\d][\d\s-]{6,19}$/.test(phone))
                throw new common_1.BadRequestException('Enter the Mobile Money account phone number.');
            if (phone.replace(/\D/g, '').endsWith('0000')) {
                throw new common_1.BadRequestException('Mobile Money payment was declined. Please try a different number.');
            }
            return this.authorised('Mobile Money', amount, 'MOMO');
        },
        card: (amount, details) => {
            const number = String(details.cardNumber ?? '').replace(/\s/g, '');
            const name = String(details.cardName ?? '').trim();
            const expiry = String(details.cardExpiry ?? '');
            const cvv = String(details.cardCvv ?? '');
            if (name.length < 2)
                throw new common_1.BadRequestException('Enter the name on the card.');
            if (!/^\d{12,19}$/.test(number))
                throw new common_1.BadRequestException('Enter a valid card number (demo mode: use 12-19 digits).');
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
                throw new common_1.BadRequestException('Card expiry must be in MM/YY format.');
            if (!/^\d{3,4}$/.test(cvv))
                throw new common_1.BadRequestException('Enter the card security code.');
            if (number.endsWith('0000')) {
                throw new common_1.BadRequestException('Card payment was declined by the issuer. Please try another card.');
            }
            return this.authorised('Card', amount, 'CARD');
        },
        cod: () => ({
            status: 'pending',
            provider: 'Cash on Delivery',
            reference: `COD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            message: 'Pay in cash when your order arrives.',
        }),
        bank: () => ({
            status: 'pending',
            provider: 'Bank Transfer',
            reference: `BNK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            message: 'Transfer to Sherriez Scents, Metro Bank, account 1234-5678-90. Use your order number as the reference.',
            instructions: 'Your order will be processed once the transfer is confirmed.',
        }),
    };
    authorised(provider, _amount, prefix) {
        return {
            status: 'paid',
            provider,
            reference: `${prefix}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
            message: 'Payment confirmed.',
        };
    }
    charge(method, amount, details) {
        const provider = this.providers[method];
        if (!provider)
            throw new common_1.BadRequestException('Choose a valid payment method.');
        return provider(amount, details);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)()
], PaymentsService);
//# sourceMappingURL=payments.service.js.map