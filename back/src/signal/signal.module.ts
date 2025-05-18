import { Module } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SignalGateway],
  exports: [SignalGateway],
})
export class SignalModule {}
