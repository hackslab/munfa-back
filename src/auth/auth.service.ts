import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_SERVICE } from '../sms/sms.service.interface';
import type { SmsService } from '../sms/sms.service.interface';
import { checkNumberDto, loginDto, sendOtpDto, setNameDto, setPasswordDto, verifyOtpDto } from './dto/user-auth.dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(SMS_SERVICE) private smsService: SmsService,
  ) {}

  async checkNumber(dto: checkNumberDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });
    return { exists: !!user };
  }

  async sendOtp(dto: sendOtpDto) {
    const otp = randomInt(100000, 1000000); // 6 digit OTP (100000 to 999999)
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await this.smsService.sendOtp(dto.phone, otp);

    await this.prisma.user.upsert({
      where: { phone: dto.phone },
      update: {
        otp,
        otp_expire: otpExpire,
        reg_step: 1,
      },
      create: {
        phone: dto.phone,
        otp,
        otp_expire: otpExpire,
        reg_step: 1,
      },
    });
    
    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: verifyOtpDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });

    if (!user || !user.otp || !user.otp_expire)
      throw new ForbiddenException('Invalid request');

    if (user.otp !== dto.otp) throw new ForbiddenException('Invalid OTP');
    if (new Date() > user.otp_expire) throw new ForbiddenException('OTP Expired');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        otp: null,
        otp_expire: null,
        reg_step: 2,
      },
    });

    const tokens = await this.getTokens(updatedUser.id, updatedUser.phone);
    await this.updateRefreshTokenHash(updatedUser.id, tokens.refresh_token);
    return tokens;
  }

  async setPassword(userId: string, dto: setPasswordDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash, reg_step: 3 },
    });
    return { message: 'Password set successfully' };
  }

  async setName(userId: string, dto: setNameDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, reg_step: 4 },
    });
    return { message: 'Registration completed' };
  }

  async login(dto: loginDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });

    if (!user || !user.password) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.phone);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId, refresh_token: { not: null } },
      data: { refresh_token: null },
    });
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refresh_token) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.refresh_token);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.phone);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hash },
    });
  }

  async getTokens(userId: string, phone: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, phone },
        { secret: process.env.JWT_ACCESS_SECRET || 'at-secret', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, phone },
        { secret: process.env.JWT_REFRESH_SECRET || 'rt-secret', expiresIn: '7d' },
      ),
    ]);
    return { access_token: at, refresh_token: rt };
  }
}
