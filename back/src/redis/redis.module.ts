import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  providers: [RedisService, StatsModule],
  exports: [RedisService],
})
export class RedisModule {}
