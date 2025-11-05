import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('subscribers') // Имя таблицы в БД
export class Subscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Telegram ID пользователя уникален
  telegramId: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column('simple-array')
  themes: string[];

  @Column({ nullable: true })
  utmSource: string;

  @Column({ nullable: true })
  utmMedium: string;

  @Column({ nullable: true })
  utmCampaign: string;

  @CreateDateColumn()
  subscribedAt: Date;
}
