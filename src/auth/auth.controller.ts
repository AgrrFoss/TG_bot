import { Request, Controller, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('v1.0/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signIn(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create({
      login: createUserDto.username,
      password: createUserDto.password,
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('signout')
  signOut(@Request() req: any) {
    return req.logout();
  }
}
