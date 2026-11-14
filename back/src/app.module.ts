import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SignalModule } from './signal/signal.module';

@Module({
  imports: [DatabaseModule, SignalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
