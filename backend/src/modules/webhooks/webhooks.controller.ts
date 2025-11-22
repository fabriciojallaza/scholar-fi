import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('api/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private webhooksService: WebhooksService) {}

  /**
   * Privy webhook endpoint
   * Receives wallet.balance_changed events
   */
  @Post('privy')
  async handlePrivyWebhook(
    @Headers('x-privy-signature') signature: string,
    @Body() body: any,
  ) {
    try {
      // Verify webhook signature
      const isValid = this.webhooksService.verifyPrivyWebhook(signature, body);
      if (!isValid) {
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      const { event, data } = body;

      this.logger.log(`Received Privy webhook: ${event}`);

      if (event === 'wallet.balance_changed') {
        const result = await this.webhooksService.handleBalanceChange(data);
        return result;
      }

      return { message: 'Event ignored' };
    } catch (error) {
      this.logger.error(`Error handling Privy webhook: ${error.message}`);
      throw new HttpException(
        {
          error: 'Failed to process webhook',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Celo verification checker
   * Can be called as cron job or manually
   */
  @Get('celo/check')
  @Post('celo/check')
  async checkCeloVerifications() {
    try {
      this.logger.log('Manual trigger: Checking Celo verifications');
      const result = await this.webhooksService.checkCeloVerifications();
      return result;
    } catch (error) {
      this.logger.error(`Error checking Celo verifications: ${error.message}`);
      throw new HttpException(
        {
          error: 'Failed to check Celo verifications',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
