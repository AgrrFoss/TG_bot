import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  telegramId: number;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;
}
