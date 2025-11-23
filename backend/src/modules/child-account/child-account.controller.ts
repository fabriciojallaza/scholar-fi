import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ChildAccountService } from './child-account.service';
import { CreateChildAccountDto } from '../../common/dto/create-child-account.dto';

@Controller('api/child-account')
export class ChildAccountController {
  private readonly logger = new Logger(ChildAccountController.name);

  constructor(private childAccountService: ChildAccountService) {}

  @Post('create')
  async createChildAccount(@Body() dto: CreateChildAccountDto) {
    try {
      // Log what we received
      this.logger.log(`Received request body: ${JSON.stringify(dto)}`);

      // Validate inputs
      if (!dto.parentUserId || !dto.childName || !dto.childDateOfBirth || !dto.parentEmail) {
        this.logger.error(`Validation failed - Missing fields in: ${JSON.stringify(dto)}`);
        throw new HttpException(
          'Missing required fields: parentUserId, childName, childDateOfBirth, parentEmail',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Received create child account request for parent: ${dto.parentUserId}`);

      const result = await this.childAccountService.createChildAccount(dto);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create child account: ${error.message}`);
      throw new HttpException(
        {
          error: 'Failed to create child account',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
