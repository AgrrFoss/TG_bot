import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { SubscriberIdentity } from './subscriber-identity.entity';

@Entity('subscribers') // Имя таблицы в БД
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column('simple-array', { nullable: true })
  themes?: string[];

  @Column({ nullable: true })
  isStudent?: boolean;

  @Column({ nullable: true, default: false })
  unsubscribed?: boolean;

  @Column({ nullable: true })
  utmSource?: string;

  @Column({ nullable: true })
  utmMedium?: string;

  @Column({ nullable: true })
  utmCampaign?: string;

  @OneToMany(() => SubscriberIdentity, (i) => i.subscriber)
  identities: SubscriberIdentity[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  aiPausedUntil?: Date; // До какого времени ИИ "спит" для этого пользователя

  @OneToMany(() => Application, (application) => application.id)
  applications: Application[];
}
