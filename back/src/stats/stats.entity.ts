import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class FileTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileSize: number; // en octets

  @CreateDateColumn()
  createdAt: Date;
}
