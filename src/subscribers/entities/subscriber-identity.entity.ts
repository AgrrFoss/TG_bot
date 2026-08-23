import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Subscriber } from './subscriber.entity';

@Entity('subscriber_identities') // Имя таблицы в БД
@Unique(['platform', 'platformId'])
export class SubscriberIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscriber, (subscriber) => subscriber.identities, {
    onDelete: 'CASCADE',
  })
  subscriber: Subscriber;

  @Column() platform: string;

  @Column() platformId: string;

  @Column({ nullable: true }) username?: string;

  @Column({ type: 'jsonb', nullable: true }) meta?: any;

  @CreateDateColumn() createdAt: Date;
}
