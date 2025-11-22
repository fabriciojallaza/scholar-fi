import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChildAccountModule } from './modules/child-account/child-account.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PrivyModule } from './modules/privy/privy.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrivyModule,
    BlockchainModule,
    ChildAccountModule,
    WebhooksModule,
  ],
})
export class AppModule {}
