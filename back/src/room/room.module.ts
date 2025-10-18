import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RedisModule } from 'src/redis/redis.module';
import { SignalModule } from 'src/signal/signal.module';
@Module({
  imports: [RedisModule, SignalModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
