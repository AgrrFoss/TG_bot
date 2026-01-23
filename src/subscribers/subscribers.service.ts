import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
      id,
      tgId,
      vkId,
      firstName,
      lastName,
      username,
      phoneNumber,
      photoUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    } = createSubscriberDto;
    let subscriber: Subscriber | null = null;
    if (tgId) {
      subscriber = await this.subscriberRepository.findOne({ where: { tgId } });
    }
    if (!subscriber && vkId) {
      subscriber = await this.subscriberRepository.findOne({ where: { vkId } });
    }
    if (!subscriber && id) {
      subscriber = await this.subscriberRepository.findOne({
        where: { id },
      });
    }
    if (subscriber) {
      if (firstName !== undefined) subscriber.firstName = firstName;
      if (lastName !== undefined) subscriber.lastName = lastName;
      if (username !== undefined) subscriber.username = username;
      if (phoneNumber !== undefined) subscriber.phoneNumber = phoneNumber;
      if (photoUrl !== undefined) subscriber.photoUrl = photoUrl;
      if (utmSource !== undefined) subscriber.utmSource = utmSource;
      if (utmMedium !== undefined) subscriber.utmMedium = utmMedium;
      if (utmCampaign !== undefined) subscriber.utmCampaign = utmCampaign;
      // Важно: tgId и vkId тоже могут быть частью обновления, если они были null
      if (tgId !== undefined) subscriber.tgId = tgId;
      if (vkId !== undefined) subscriber.vkId = vkId;
    } else {
      subscriber = this.subscriberRepository.create({
        tgId,
        vkId,
        firstName,
        lastName,
        username,
        phoneNumber,
        photoUrl,
        utmSource,
        utmMedium,
        utmCampaign,
      });
    }
    return this.subscriberRepository.save(subscriber);
  }

  async findAll(): Promise<Subscriber[]> {
    return this.subscriberRepository.find();
  }

  async findByTelegramId(id: string): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { id } });
  }

  async findByUserName(username: string): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { username } });
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto) {
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

  async remove(id: string) {
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
