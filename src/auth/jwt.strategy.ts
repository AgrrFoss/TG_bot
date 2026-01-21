import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { Repository } from 'typeorm';
config();
const configService = new ConfigService();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'simple_secret'),
    });
  }
  async validate(payload: { sub: string }) {
    const foundAdmin = await this.adminRepository.findOne({
      where: { id: payload.sub },
    });
    if (!foundAdmin) {
      return null;
    }
    return {
      id: payload.sub,
    };
  }
}

const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies.jwt as string;
  }
  return token;
};
