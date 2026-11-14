import { Module } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { PeerClaimsService } from './peer-claims.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [StatsModule],
  providers: [SignalGateway, PeerClaimsService],
})
export class SignalModule {}
