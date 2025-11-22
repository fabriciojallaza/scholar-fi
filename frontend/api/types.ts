/**
 * Shared types for serverless API functions
 */

export interface CreateChildAccountRequest {
  parentUserId: string;
  childName: string;
  childDateOfBirth: number; // Unix timestamp
  parentEmail: string;
}

export interface CreateChildAccountResponse {
  success: boolean;
  childAddress: string;
  checkingWallet: {
    id: string;
    address: string;
  };
  vaultWallet: {
    id: string;
    address: string;
  };
  oasisProfileCreated: boolean;
  celoRegistered: boolean;
  baseRegistered: boolean;
}

export interface PrivyWebhookEvent {
  event_type: string;
  wallet_id?: string;
  user_id?: string;
  balance_change?: string;
  timestamp: number;
}

export interface CeloVerificationEvent {
  childAddress: string;
  parentAddress: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
