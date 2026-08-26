import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { SubscriberIdentity } from './entities/subscriber-identity.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,
    @InjectRepository(SubscriberIdentity)
    private readonly identityRepository: Repository<SubscriberIdentity>,
  ) {}
  async findById(id: string): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { id } });
  }
  async findOrCreate(
    platform: string,
    platformId: string,
    dto: CreateSubscriberDto,
  ): Promise<{ subscriber: Subscriber; identity: SubscriberIdentity }> {
    const existingIdentity = await this.identityRepository.findOne({
      where: { platform, platformId },
      relations: ['subscriber'],
    });
    if (existingIdentity) {
      return {
        subscriber: existingIdentity.subscriber,
        identity: existingIdentity,
      };
    }
    const newSubscriber = this.subscriberRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      photoUrl: dto.photoUrl,
      phoneNumber: dto.phoneNumber,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
    });
    const savedSubscriber = await this.subscriberRepository.save(newSubscriber);
    const newIdentity = this.identityRepository.create({
      platform: platform,
      platformId: platformId,
      username: dto.username,
      subscriber: savedSubscriber,
    });
    const savedIdentity = await this.identityRepository.save(newIdentity);
    return {
      subscriber: savedSubscriber,
      identity: savedIdentity,
    };
  }

  async findByPlatform(platform: string, platformId: string) {
    const identity = await this.identityRepository.findOne({
      where: { platform, platformId },
      relations: ['subscriber'],
    });
    if (!identity) {
      return null;
    }
    return {
      subscriber: identity.subscriber,
      identity: identity,
    };
  }

  async updateAiPause(subscriberId: string, minutes: number): Promise<void> {
    const pausedUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.subscriberRepository.update(subscriberId, {
      aiPausedUntil: pausedUntil,
    });
  }
  async getUsernameForPlatform(
    subscriberId: string,
    platform: string,
  ): Promise<string> {
    const identity = await this.identityRepository.findOne({
      where: { subscriber: { id: subscriberId }, platform },
    });
    return identity?.username || '—';
  }

  async findAll(): Promise<Subscriber[]> {
    return this.subscriberRepository.find();
  }

  async findByTelegramId(id: string): Promise<Subscriber | null> {
    return this.subscriberRepository.findOne({ where: { id } });
  }

  async findByUserName(username: string): Promise<SubscriberIdentity | null> {
    return this.identityRepository.findOne({ where: { username } });
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
