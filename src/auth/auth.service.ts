import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { Admin } from '../admins/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { FindAdminDto } from '../admins/dto/find-admin.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto'; // Импортируем Node.js crypto

interface IInitData {
  user?: {
    id: number;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateAdmin({
    telegramId,
    accessData,
  }: FindAdminDto): Promise<Omit<Admin, 'password'> | null> {
    const admin = await this.adminService.findAdmin({ telegramId, accessData });
    if (admin) {
      return admin;
    }
    return null;
  }

  async login(
    admin: Omit<Admin, 'password'>,
    res: Response,
  ): Promise<{ access_token: string }> {
    const payload = { sub: admin.id };
    res.cookie('jwt', this.jwtService.sign(payload), { httpOnly: true });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async telegramMiniAppLogin(initData: string, res: Response) {
    const botToken: string | undefined =
      await this.configService.get('BOT_TOKEN');
    if (!botToken) {
      throw new Error('BOT_TOKEN is not defined in environment variables.');
    }
    try {
      const verifiedData = this.verifyTelegramInitData(initData, botToken);
      const telegramId: number | undefined = verifiedData.user?.id;
      if (!telegramId) {
        throw new UnauthorizedException(
          'Telegram user ID not found in initData.',
        );
      }
      const admin = await this.adminService.findAdmin({ telegramId });
      if (admin) {
        await this.login(admin, res);
        const { password, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      }
      return null;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException(
        'Invalid Telegram InitData or Admin not found.',
      );
    }
  }

  private verifyTelegramInitData(
    initData: string,
    botToken: string,
  ): IInitData {
    const data = new URLSearchParams(initData);
    const hash = data.get('hash');
    data.delete('hash'); // Удаляем hash для проверки подписи

    // Сортируем параметры по ключу и формируем строку для проверки
    const checkString = Array.from(data.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Ключ для HMAC (из токена бота)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем HMAC-SHA256 хеш от checkString с использованием secretKey
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram initData signature.');
    }

    // Парсим user, query_id и т.д.
    const userData = {};
    for (const [key, value] of new URLSearchParams(initData).entries()) {
      if (key === 'user' || key === 'receiver' || key === 'chat') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          userData[key] = JSON.parse(decodeURIComponent(value));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          userData[key] = value; // fallback
        }
      } else if (key !== 'hash') {
        // Игнорируем hash
        userData[key] = value;
      }
    }

    return userData;
  }
}
