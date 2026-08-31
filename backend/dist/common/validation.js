"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqStr = reqStr;
exports.optStr = optStr;
exports.reqEmail = reqEmail;
exports.reqPhone = reqPhone;
exports.reqNum = reqNum;
exports.reqEnum = reqEnum;
exports.validatePassword = validatePassword;
const common_1 = require("@nestjs/common");
function reqStr(v, field, min = 1, max = 500) {
    if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
        throw new common_1.BadRequestException(`${field} is required (${min}-${max} characters).`);
    }
    return v.trim();
}
function optStr(v, max = 500) {
    if (v === undefined || v === null || v === '')
        return undefined;
    if (typeof v !== 'string' || v.length > max)
        throw new common_1.BadRequestException('Invalid text value.');
    return v.trim();
}
function reqEmail(v) {
    const s = reqStr(v, 'Email', 5, 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s))
        throw new common_1.BadRequestException('Please enter a valid email address.');
    return s;
}
function reqPhone(v) {
    const s = reqStr(v, 'Phone number', 7, 20);
    if (!/^[+\d][\d\s-]{6,19}$/.test(s))
        throw new common_1.BadRequestException('Please enter a valid phone number.');
    return s;
}
function reqNum(v, field, min, max) {
    const n = typeof v === 'string' ? Number(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || n < min || n > max) {
        throw new common_1.BadRequestException(`${field} must be between ${min} and ${max}.`);
    }
    return n;
}
function reqEnum(v, field, allowed) {
    if (typeof v !== 'string' || !allowed.includes(v)) {
        throw new common_1.BadRequestException(`${field} must be one of: ${allowed.join(', ')}.`);
    }
    return v;
}
function validatePassword(pw) {
    const s = reqStr(pw, 'Password', 8, 100);
    if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) {
        throw new common_1.BadRequestException('Password must contain at least one letter and one number.');
    }
    return s;
}
//# sourceMappingURL=validation.js.map