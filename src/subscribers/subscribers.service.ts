import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,
  ) {}

  async createOrUpdate(
    createSubscriberDto: CreateSubscriberDto,
  ): Promise<Subscriber> {
    const {
      telegramId,
      firstName,
      lastName,
      username,
      utmSource,
      utmMedium,
      utmCampaign,
    } = createSubscriberDto;
    let subscriber = await this.subscriberRepository.findOne({
      where: { telegramId },
    });

    if (!subscriber) {
      subscriber = this.subscriberRepository.create({
        telegramId,
        firstName,
        lastName,
        username,
        utmSource,
        utmMedium,
        utmCampaign,
      });
    } else {
      // Обновляем данные, если они изменились
      subscriber.firstName = firstName || subscriber.firstName;
      subscriber.lastName = lastName || subscriber.lastName;
      subscriber.username = username || subscriber.username;
      subscriber.utmSource = utmSource || subscriber.utmSource;
      subscriber.utmMedium = utmMedium || subscriber.utmMedium;
      subscriber.utmCampaign = utmCampaign || subscriber.utmCampaign;
    }

    return this.subscriberRepository.save(subscriber);
  }

  async findAll(): Promise<Subscriber[]> {
    return this.subscriberRepository.find();
  }

  async findByTelegramId(telegramId: number): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { telegramId } });
  }

  create(createSubscriberDto: CreateSubscriberDto) {
    return 'This action adds a new subscriber';
  }

  findOne(id: number) {
    return `This action returns a #${id} subscriber`;
  }

  update(id: number, updateSubscriberDto: UpdateSubscriberDto) {
    return `This action updates a #${id} subscriber`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscriber`;
  }
}

