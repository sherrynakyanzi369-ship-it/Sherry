import { PaymentMethod } from '../config';
export interface PaymentResult {
    status: 'paid' | 'pending';
    provider: string;
    reference: string;
    message?: string;
    instructions?: string;
}
export interface PaymentProvider {
    method: PaymentMethod;
    label: string;
    pay(amount: number, details: Record<string, unknown>): PaymentResult;
}
export declare class PaymentsService {
    private readonly providers;
    private authorised;
    charge(method: string, amount: number, details: Record<string, unknown>): PaymentResult;
}
