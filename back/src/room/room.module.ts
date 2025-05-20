import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SignalModule } from 'src/signal/signal.module';
@Module({
  imports: [RedisModule, SignalModule],
  providers: [RoomService],
  exports: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
