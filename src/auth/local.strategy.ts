import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }
  async validate(email: string, password: string): Promise<any> {
    const admin = await this.authService.validateAdmin({
      telegramId: undefined,
      accessData: { email, password },
    });
    if (!admin) {
      throw new UnauthorizedException();
    }
    return admin;
  }
}
