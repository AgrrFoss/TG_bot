import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../auth/dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { FindAdminDto } from './dto/find-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();
const configService = new ConfigService();
const saltOrRounds = +configService.get('PASSWORD_HASH_SALT_OR_ROUNDS', 10);

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin) private adminsRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    let existAdmin: Admin | null = null;
    if (createAdminDto.accessData) {
      existAdmin = await this.adminsRepository.findOne({
        where: { email: createAdminDto.accessData.email },
      });
    }
    if (createAdminDto.telegramId) {
      existAdmin = await this.adminsRepository.findOne({
        where: { telegramId: createAdminDto.telegramId },
      });
    }
    if (existAdmin) {
      throw new BadRequestException(
        `Admin with ${createAdminDto?.accessData?.email} or ${createAdminDto.telegramId} already exists`,
      );
    }
    if (createAdminDto?.accessData?.password) {
      createAdminDto.accessData.password = await bcrypt.hash(
        createAdminDto?.accessData?.password,
        saltOrRounds,
      );
    }
    const newAdmin = {
      telegramId: createAdminDto.telegramId,
      email: createAdminDto?.accessData?.email,
      password: createAdminDto?.accessData?.password,
    };
    return this.adminsRepository.save(newAdmin);
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: string) {
    return this.adminsRepository.findOne({ where: { id: id } });
  }
  async findAdmin({
    telegramId,
    accessData,
  }: FindAdminDto): Promise<Admin | null> {
    try {
      let foundAdmin: Admin | null = null;
      if (telegramId) {
        foundAdmin = await this.adminsRepository.findOne({
          where: { telegramId },
        });
      }
      if (accessData) {
        const foundEmailAdmin: Admin | null =
          await this.adminsRepository.findOne({
            where: { email: accessData.email },
          });
        if (
          foundEmailAdmin?.password &&
          (await bcrypt.compare(accessData.password, foundEmailAdmin.password))
        ) {
          foundAdmin = foundEmailAdmin;
        }
      }
      return foundAdmin;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
