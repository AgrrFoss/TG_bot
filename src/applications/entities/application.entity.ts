import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscriber, (subscriber) => subscriber.id)
  subscriber: Subscriber;

  @Column()
  name: string;

  @Column()
  formName: string;

  @Column({ nullable: true })
  utmString: string;

  @Column('simple-json', { nullable: true })
  formData: { age?: string; other?: string };

  @CreateDateColumn()
  createdAt: Date;
}
