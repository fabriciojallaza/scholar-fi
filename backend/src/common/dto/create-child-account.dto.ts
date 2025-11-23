import { IsString, IsNumber, IsEmail } from 'class-validator';

export class CreateChildAccountDto {
  @IsString()
  parentUserId: string;      // Privy user ID (e.g., did:privy:abc123)

  @IsString()
  childName: string;

  @IsNumber()
  childDateOfBirth: number;  // Unix timestamp

  @IsEmail()
  parentEmail: string;
}

export class CreateChildAccountResponse {
  success: boolean;
  childAddress: string;
  childUserId: string;
  childPrivyEmail: string;
  checkingWallet: string;
  checkingWalletId: string;
  vaultWallet: string;
  vaultWalletId: string;
  parentWallet: string;
  oasisProfileCreated: boolean;
  celoRegistered: boolean;
  baseRegistered: boolean;
  message?: string;
}
