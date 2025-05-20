import { Module } from '@nestjs/common';
import { StatsModule } from './stats/stats.module';
import { SignalGateway } from './signal/signal.gateway';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { RoomModule } from './room/room.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    StatsModule,
    RedisModule,
    RoomModule,
  ],
  providers: [SignalGateway],
})
export class AppModule {}
