import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const userWithRoles = await this.usersRepository.findOne({
      select: ['id', 'roles'],
      relations: ['roles'],
      where: { id: user.userId },
    });
    const receivedRoles = userWithRoles?.roles.map((role) => role.name);
    const allowedRoles: Array<string> = this.reflector.getAllAndOverride(
      'Roles',
      [context.getHandler(), context.getClass()],
    );
    for (const role of allowedRoles) {
      if (receivedRoles && receivedRoles.includes(role)) {
        return true;
      }
    }
    return false;
  }
}
