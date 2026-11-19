import { Module } from '@nestjs/common';
import { SignalGateway } from './signal.gateway';
import { HeldPlacesService } from './held-places.service';
import { PeerClaimsService } from './peer-claims.service';
import { RelayTokensService } from './relay-tokens.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [StatsModule],
  providers: [
    SignalGateway,
    HeldPlacesService,
    PeerClaimsService,
    RelayTokensService,
  ],
})
export class SignalModule {}
