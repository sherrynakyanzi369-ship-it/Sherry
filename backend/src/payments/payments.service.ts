import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentMethod } from '../config';

export interface PaymentResult {
  status: 'paid' | 'pending';
  provider: string;
  reference: string;
  message?: string;
  instructions?: string;
}

/**
 * Payment provider abstraction.
 *
 * Demo mode: no real gateway credentials are configured in this environment,
 * so Mobile Money and Card flows are simulated deterministically:
 *   - any phone / card number ending in "0000" simulates a declined payment
 *   - all other values simulate a successful authorisation
 *
 * To integrate a real gateway, implement PaymentProvider for it and register
 * it in PAYMENT_PROVIDERS below. Secret keys must live in environment
 * variables on the server — never in frontend code.
 */
export interface PaymentProvider {
  method: PaymentMethod;
  label: string;
  pay(amount: number, details: Record<string, unknown>): PaymentResult;
}

@Injectable()
export class PaymentsService {
  private readonly providers: Record<PaymentMethod, (amount: number, details: Record<string, unknown>) => PaymentResult> = {
    momo: (amount, details) => {
      const phone = String(details.phone ?? '');
      if (!/^[+\d][\d\s-]{6,19}$/.test(phone)) throw new BadRequestException('Enter the Mobile Money account phone number.');
      if (phone.replace(/\D/g, '').endsWith('0000')) {
        throw new BadRequestException('Mobile Money payment was declined. Please try a different number.');
      }
      return this.authorised('Mobile Money', amount, 'MOMO');
    },
    card: (amount, details) => {
      const number = String(details.cardNumber ?? '').replace(/\s/g, '');
      const name = String(details.cardName ?? '').trim();
      const expiry = String(details.cardExpiry ?? '');
      const cvv = String(details.cardCvv ?? '');
      if (name.length < 2) throw new BadRequestException('Enter the name on the card.');
      if (!/^\d{12,19}$/.test(number)) throw new BadRequestException('Enter a valid card number (demo mode: use 12-19 digits).');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) throw new BadRequestException('Card expiry must be in MM/YY format.');
      if (!/^\d{3,4}$/.test(cvv)) throw new BadRequestException('Enter the card security code.');
      if (number.endsWith('0000')) {
        throw new BadRequestException('Card payment was declined by the issuer. Please try another card.');
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

  private authorised(provider: string, _amount: number, prefix: string): PaymentResult {
    return {
      status: 'paid',
      provider,
      reference: `${prefix}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      message: 'Payment confirmed.',
    };
  }

  charge(method: string, amount: number, details: Record<string, unknown>): PaymentResult {
    const provider = this.providers[method as PaymentMethod];
    if (!provider) throw new BadRequestException('Choose a valid payment method.');
    return provider(amount, details);
  }
}
