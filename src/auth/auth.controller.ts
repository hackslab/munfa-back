import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { checkNumberDto, loginDto, sendOtpDto, setNameDto, setPasswordDto, verifyOtpDto } from './dto/user-auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { RtGuard } from '../common/guards/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('check-number')
  @HttpCode(HttpStatus.OK)
  checkNumber(@Body() dto: checkNumberDto) {
    return this.authService.checkNumber(dto);
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: sendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: verifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyOtp(dto);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return tokens;
  }

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  setPassword(@GetCurrentUserId() userId: string, @Body() dto: setPasswordDto) {
    return this.authService.setPassword(userId, dto);
  }

  @Post('set-name')
  @HttpCode(HttpStatus.OK)
  setName(@GetCurrentUserId() userId: string, @Body() dto: setNameDto) {
    return this.authService.setName(userId, dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: loginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return tokens;
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      sameSite: 'lax', // Use 'none' and secure: true for cross-site in prod
      secure: false, // Set to true in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
