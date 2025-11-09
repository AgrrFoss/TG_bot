import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
// import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

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
      id,
      firstName,
      lastName,
      username,
      phoneNumber,
      photoUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    } = createSubscriberDto;
    let subscriber = await this.subscriberRepository.findOne({
      where: { id },
    });

    if (!subscriber) {
      subscriber = this.subscriberRepository.create({
        id,
        firstName,
        lastName,
        username,
        phoneNumber,
        photoUrl,
        utmSource,
        utmMedium,
        utmCampaign,
      });
    } else {
      subscriber.firstName = firstName || subscriber.firstName;
      subscriber.lastName = lastName || subscriber.lastName;
      subscriber.username = username || subscriber.username;
      subscriber.phoneNumber = phoneNumber || subscriber.phoneNumber;
      subscriber.photoUrl = photoUrl || subscriber.photoUrl;
      subscriber.utmSource = utmSource || subscriber.utmSource;
      subscriber.utmMedium = utmMedium || subscriber.utmMedium;
      subscriber.utmCampaign = utmCampaign || subscriber.utmCampaign;
    }

    return this.subscriberRepository.save(subscriber);
  }

  async findAll(): Promise<Subscriber[]> {
    return this.subscriberRepository.find();
  }

  async findByTelegramId(id: number): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { id } });
  }

  async findByUserName(username: string): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { username } });
  }

  async update(id: number, updateSubscriberDto: UpdateSubscriberDto) {
    const { phoneNumber, themes, isStudent, unsubscribed } =
      updateSubscriberDto;
    const subscriber = await this.subscriberRepository.findOne({
      where: { id },
    });
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }
    subscriber.phoneNumber = phoneNumber || subscriber.phoneNumber;
    subscriber.themes = themes || subscriber.themes;
    subscriber.isStudent = isStudent || subscriber.isStudent;
    subscriber.unsubscribed = unsubscribed || subscriber.unsubscribed;
    return this.subscriberRepository.save(subscriber);
  }

  async remove(id: number) {
    const subscriber = await this.subscriberRepository.findOne({
      where: { id },
    });
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }
    return this.subscriberRepository.remove(subscriber);
  }

  async removeSeveral(ids: number[]) {
    return this.subscriberRepository.delete({ id: In(ids) });
  }
}
