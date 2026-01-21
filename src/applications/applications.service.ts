import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { SubscribersService } from '../subscribers/subscribers.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly subscriberService: SubscribersService,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const formData = createApplicationDto.formData;
    const user = createApplicationDto.userData;
    const utmString = `utmSource: ${user.utmSource || null}, utmMedium: ${user.utmMedium || null}, utmCampaign: ${user.utmCampaign || null};`;
    for (const key in user) {
      if (key === 'utmSource' || key === 'utmMedium' || key === 'utmCampaign') {
        delete user[key];
      }
    }
    user.phoneNumber = formData.phone;
    const subscriber = await this.subscriberService.createOrUpdate(user);
    const newApplication = {
      subscriber: subscriber,
      formName: createApplicationDto.formName,
      utmString,
      name: formData.name,
      formData: { age: formData.age },
    };
    return this.applicationRepository.save(newApplication);
  }

  async findAll() {
    return this.applicationRepository.find();
  }

  async findOne(id: number) {
    return this.applicationRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const removeApplication = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!removeApplication) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return this.applicationRepository.remove(removeApplication);
  }
}
