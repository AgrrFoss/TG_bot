import {
  Request,
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Admin } from '../admins/entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminsService } from '../admins/admins.service';
import { TelegramLoginDto } from './dto/telegramLogin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('v1.0/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: Admin }) {
    return this.adminService.findOne(req.user.id);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signIn(
    @Req() req: { user: Admin },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req.user, res);
  }

  @Post('telegram')
  async telegramLogin(
    @Body() { initData }: TelegramLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<Admin, 'password'> | null> {
    return this.authService.telegramMiniAppLogin(initData, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signup')
  signUp(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signout')
  signOut(@Request() req: any) {
    return req.logout();
  }
}
