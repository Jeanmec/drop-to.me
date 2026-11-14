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

  // bytes; pg hands a bigint back as a string when a row is read
  @Column({ type: 'bigint' })
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;
}
