import { Module } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { SignalService } from './signal.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [RedisModule, StatsModule],
  providers: [SignalGateway, SignalService],
  exports: [SignalGateway, SignalService],
})
export class SignalModule {}
