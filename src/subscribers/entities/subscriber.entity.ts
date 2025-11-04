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

  @CreateDateColumn()
  subscribedAt: Date;
}
