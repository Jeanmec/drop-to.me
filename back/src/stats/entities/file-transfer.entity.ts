import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('file_transfers')
export class FileTransferEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileSize: number; // octets

  @CreateDateColumn()
  createdAt: Date;
}
