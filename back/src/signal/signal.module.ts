import { Module } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { RoomModule } from 'src/room/room.module';
import { RedisModule } from 'src/redis/redis.module';
import { SignalService } from './signal.service';

@Module({
  imports: [RoomModule, RedisModule],
  providers: [SignalGateway, SignalService],
  exports: [SignalGateway],
})
export class SignalModule {}
