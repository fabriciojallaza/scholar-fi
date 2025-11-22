import { Module } from '@nestjs/common';
import { ChildAccountController } from './child-account.controller';
import { ChildAccountService } from './child-account.service';
import { PrivyModule } from '../privy/privy.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrivyModule, BlockchainModule],
  controllers: [ChildAccountController],
  providers: [ChildAccountService],
})
export class ChildAccountModule {}
