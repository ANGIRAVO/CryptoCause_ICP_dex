import { Principal } from '@dfinity/principal';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  recipient: Principal;
  targetAmount: bigint;
  currentAmount: bigint;
  isActive: boolean;
  createdAt: bigint;
  endDate?: bigint;
  withdrawable: boolean;
}

export interface Donation {
  id: bigint;
  donor: Principal;
  campaignId: string;
  amount: bigint;
  timestamp: bigint;
  txHash?: string;
}

export interface NFTMetadata {
  tokenId: bigint;
  donationId: bigint;
  donor: Principal;
  campaignId: string;
  amount: bigint;
  timestamp: bigint;
  imageUrl: string;
  attributes: [string, string][];
}

export interface WalletInfo {
  principal: Principal | null;
  isConnected: boolean;
  balance: bigint;
  identity: any;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export type DonationError = 
  | { CampaignNotFound: null }
  | { InsufficientAmount: null }
  | { CampaignInactive: null }
  | { Unauthorized: null }
  | { TransferFailed: null };

export type NFTError = 
  | { TokenNotFound: null }
  | { Unauthorized: null }
  | { AlreadyExists: null }
  | { InvalidMetadata: null };

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CampaignStats {
  totalDonations: bigint;
  totalAmount: bigint;
  totalCampaigns: bigint;
}

export interface CreateCampaignData {
  id: string;
  title: string;
  description: string;
  targetAmount: bigint;
  endDate?: bigint;
}
