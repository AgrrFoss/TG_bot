import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { SubscriberIdentity } from '../../subscribers/entities/subscriber-identity.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscriber, { nullable: true, onDelete: 'SET NULL' })
  @Index()
  subscriber?: Subscriber;

  @ManyToOne(() => SubscriberIdentity, { nullable: true, onDelete: 'SET NULL' })
  @Index()
  identity?: SubscriberIdentity; // конкретный профиль на платформе

  @Column({ type: 'varchar', length: 30 })
  platform: string; // 'telegram' | 'vk' | 'max'

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any; // raw update from platform, attachments info, buttons, etc.

  @Column({ type: 'enum', enum: ['in', 'out'] })
  @Index()
  direction: 'in' | 'out';

  @Column({
    type: 'enum',
    enum: ['client', 'ai', 'manager'],
    default: 'client',
  })
  @Index()
  senderType: 'client' | 'ai' | 'manager';

  @Column({ nullable: true })
  externalId?: string; // message id on platform

  @Column({ nullable: true })
  conversationId?: string; // id of conversation/thread

  @Column({ default: false })
  processedByAi?: boolean;

  @Column({ nullable: true })
  aiResponseMeta?: string; // short info about AI response (confidence, model)

  @CreateDateColumn()
  createdAt: Date;
}
