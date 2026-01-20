import { Exclude } from 'class-transformer';
import {
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  @Exclude()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log('User inserted:', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('User updated:', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('User removed:', this.id);
  }
}
