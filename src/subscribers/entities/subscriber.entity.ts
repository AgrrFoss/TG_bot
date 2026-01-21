import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity';

@Entity('subscribers') // Имя таблицы в БД
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true }) // Telegram ID пользователя уникален
  tgId?: number;

  @Column({ unique: true, nullable: true }) // Vkontakte ID пользователя уникален
  vkId?: number;

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

  @CreateDateColumn()
  subscribedAt: Date;

  @OneToMany(() => Application, (application) => application.id)
  applications: Application[];
}
