export class CreateChildAccountDto {
  parentUserId: string;      // Privy user ID (e.g., did:privy:abc123)
  childName: string;
  childDateOfBirth: number;  // Unix timestamp
  parentEmail: string;
}

export class CreateChildAccountResponse {
  success: boolean;
  childAddress: string;
  childUserId: string;
  childPrivyEmail: string;
  checkingWallet: string;
  vaultWallet: string;
  parentWallet: string;
  oasisProfileCreated: boolean;
  celoRegistered: boolean;
  baseRegistered: boolean;
  policiesCreated: boolean;
  message?: string;
}
