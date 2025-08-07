import { Module } from '@nestjs/common';
import { StatsModule } from './stats/stats.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { RoomModule } from './room/room.module';
import { SignalModule } from './signal/signal.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DatabaseModule,
    StatsModule,
    RedisModule,
    RoomModule,
    SignalModule,
    UserModule,
  ],
  providers: [UserService],
})
export class AppModule {}
