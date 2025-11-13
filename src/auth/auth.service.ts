import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findUser(username, password);
    if (user) {
      return user;
    }
    return null;
  }
  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    console.log(user);
    const payload = { username: user.login, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
