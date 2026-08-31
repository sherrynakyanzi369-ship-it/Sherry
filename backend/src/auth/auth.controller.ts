import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards';
import { JsonDbService } from '../db/json-db.service';
import type { Address } from '../db/json-db.service';
import {
  reqStr, reqEmail, optStr, reqPhone, validatePassword,
} from '../common/validation';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly db: JsonDbService,
  ) {}

  @Post('register')
  register(@Body() body: Record<string, unknown>) {
    const name = reqStr(body.name, 'Full name', 2, 100);
    const email = reqEmail(body.email);
    const password = validatePassword(body.password);
    const phone = body.phone ? reqPhone(body.phone) : undefined;
    const { user, token } = this.authService.register(name, email, password, phone);
    return { token, user: this.authService.toSafeUser(user) };
  }

  @Post('login')
  login(@Body() body: Record<string, unknown>) {
    const { user, token } = this.authService.login(reqEmail(body.email), String(body.password ?? ''));
    return { token, user: this.authService.toSafeUser(user) };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request) {
    const auth = (req as Request & { user: { sub: number } }).user;
    const found = this.db.data.users.find((u) => u.id === auth.sub);
    if (!found) throw new UnauthorizedException('Account not found.');
    return this.authService.toSafeUser(found);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const auth = (req as Request & { user: { sub: number } }).user;
    const user = this.db.data.users.find((u) => u.id === auth.sub)!;
    user.name = reqStr(body.name, 'Full name', 2, 100);
    user.phone = optStr(body.phone, 20);
    this.db.save();
    return this.authService.toSafeUser(user);
  }

  @Put('password')
  @UseGuards(AuthGuard)
  changePassword(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const auth = (req as Request & { user: { sub: number } }).user;
    const user = this.db.data.users.find((u) => u.id === auth.sub)!;
    if (!this.authService.verifyPassword(String(body.currentPassword ?? ''), user.passwordHash)) {
      throw new UnauthorizedException('Your current password is incorrect.');
    }
    user.passwordHash = this.authService.hashPassword(validatePassword(body.newPassword));
    this.db.save();
    return { success: true, message: 'Password updated.' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: Record<string, unknown>) {
    const existed = this.authService.requestPasswordReset(reqEmail(body.email));
    return {
      success: true,
      message: existed
        ? 'If an account exists for that email, a reset token has been generated and printed in the server console (demo mode).'
        : 'If an account exists for that email, a reset token has been generated.',
    };
  }

  @Post('reset-password')
  resetPassword(@Body() body: Record<string, unknown>) {
    this.authService.resetPassword(reqStr(body.token, 'Reset token', 10, 200), validatePassword(body.password));
    return { success: true, message: 'Password updated. You can now sign in.' };
  }

  @Get('account/addresses')
  @UseGuards(AuthGuard)
  listAddresses(@Req() req: Request) {
    const auth = (req as Request & { user: { sub: number } }).user;
    const user = this.db.data.users.find((u) => u.id === auth.sub)!;
    return user.addresses;
  }

  @Post('account/addresses')
  @UseGuards(AuthGuard)
  addAddress(@Req() req: Request, @Body() body: Record<string, unknown>): Address[] {
    const auth = (req as Request & { user: { sub: number } }).user;
    const user = this.db.data.users.find((u) => u.id === auth.sub)!;
    const address: Address = {
      id: Date.now(),
      label: reqStr(body.label, 'Label', 1, 40),
      line1: reqStr(body.line1, 'Address', 4, 200),
      city: reqStr(body.city, 'City', 2, 80),
      district: reqStr(body.district, 'District', 2, 80),
      country: reqStr(body.country, 'Country', 2, 80),
      phone: reqPhone(body.phone),
      isDefault: Boolean(body.isDefault),
    };
    if (address.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push(address);
    this.db.save();
    return user.addresses;
  }

  @Delete('account/addresses/:id')
  @UseGuards(AuthGuard)
  removeAddress(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const auth = (req as Request & { user: { sub: number } }).user;
    const user = this.db.data.users.find((u) => u.id === auth.sub)!;
    user.addresses = user.addresses.filter((a) => a.id !== id);
    this.db.save();
    return user.addresses;
  }
}

