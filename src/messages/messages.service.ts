import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}
  async create(dto: CreateMessageDto): Promise<Message> {
    // Мапим ID из DTO в объекты связей, которые понимает TypeORM
    const newMessage = this.messageRepository.create({
      content: dto.content,
      platform: dto.platform,
      direction: dto.direction,
      senderType: dto.senderType,
      metadata: dto.metadata,
      externalId: dto.externalId,
      conversationId: dto.conversationId,
      // Если ID переданы, создаем мини-объекты со ссылкой на ID
      subscriber: dto.subscriberId ? { id: dto.subscriberId } : undefined,
      identity: dto.identityId ? { id: dto.identityId } : undefined,
    });
    return await this.messageRepository.save(newMessage);
  }
  createIncoming(createMessageDto: CreateMessageDto) {
    const newMessage = this.messageRepository.create({
      ...createMessageDto,
      direction: 'in',
    });
    return this.messageRepository.save(newMessage);
  }

  async getHistoryForAi(subscribedId: string, limit = 20) {
    const messages = await this.messageRepository.find({
      where: { subscriber: { id: subscribedId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return messages.reverse().map((msg) => {
      const role = msg.senderType === 'client' ? 'user' : 'assistant';
      return { role, content: msg.content };
    });
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}

//
// @Injectable()
// export class MessagesService {
//   constructor(
//     @InjectRepository(Message)
//     private readonly repo: Repository<Message>,
//     @InjectRepository(Subscriber)
//     private readonly subscriberRepo: Repository<Subscriber>,
//     @InjectRepository(SubscriberIdentity)
//     private readonly identityRepo: Repository<SubscriberIdentity>,
//   ) {}
//   async create(dto: CreateMessageDto): Promise<Message> {
//     let subscriber: Subscriber | undefined;
//     if (dto.subscriberId) {
//       subscriber = await this.subscriberRepo.findOne({
//         where: { id: dto.subscriberId },
//       });
//     }
//     let identity: SubscriberIdentity | undefined;
//     if (dto.identityId) {
//       identity = await this.identityRepo.findOne({
//         where: { id: dto.identityId },
//       });
//     }
//     const msg = this.repo.create({
//       subscriber,
//       identity,
//       platform: dto.platform,
//       content: dto.content,
//       metadata: dto.metadata,
//       direction: dto.direction,
//       externalId: dto.externalId,
//       conversationId: dto.conversationId,
//     });
//     return this.repo.save(msg);
//   }
//   async findBySubscriber(subscriberId: string, limit = 50) {
//     return this.repo.find({
//       where: { subscriber: { id: subscriberId } },
//       order: { createdAt: 'DESC' },
//       take: limit,
//     });
//   }
//   async findByConversation(conversationId: string) {
//     return this.repo.find({
//       where: { conversationId },
//       order: { createdAt: 'ASC' },
//     });
//   }
// }