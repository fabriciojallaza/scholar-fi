import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrivyModule } from '../privy/privy.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrivyModule, BlockchainModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
