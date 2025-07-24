import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Campaign, Donation, NFTMetadata, CreateCampaignData, CampaignStats } from '../types';

// IDL definitions for the canisters
const donationCanisterIdl = ({ IDL }: any) => {
  const DonationError = IDL.Variant({
    'CampaignNotFound': IDL.Null,
    'InsufficientAmount': IDL.Null,
    'CampaignInactive': IDL.Null,
    'Unauthorized': IDL.Null,
    'TransferFailed': IDL.Null,
  });

  const Campaign = IDL.Record({
    'id': IDL.Text,
    'title': IDL.Text,
    'description': IDL.Text,
    'recipient': IDL.Principal,
    'targetAmount': IDL.Nat,
    'currentAmount': IDL.Nat,
    'isActive': IDL.Bool,
    'createdAt': IDL.Int,
    'endDate': IDL.Opt(IDL.Int),
    'withdrawable': IDL.Bool,
  });

  const Donation = IDL.Record({
    'id': IDL.Nat,
    'donor': IDL.Principal,
    'campaignId': IDL.Text,
    'amount': IDL.Nat,
    'timestamp': IDL.Int,
    'txHash': IDL.Opt(IDL.Text),
  });

  const Result = (T: any, E: any) => IDL.Variant({ 'ok': T, 'err': E });

  return IDL.Service({
    'createCampaign': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Opt(IDL.Int)], [Result(Campaign, IDL.Text)], []),
    'getCampaigns': IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getCampaign': IDL.Func([IDL.Text], [IDL.Opt(Campaign)], ['query']),
    'donate': IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [Result(Donation, DonationError)], []),
    'getDonations': IDL.Func([IDL.Text], [IDL.Vec(Donation)], ['query']),
    'getDonationsByDonor': IDL.Func([IDL.Principal], [IDL.Vec(Donation)], ['query']),
    'withdraw': IDL.Func([IDL.Text], [Result(IDL.Nat, DonationError)], []),
    'getTotalStats': IDL.Func([], [IDL.Record({
      'totalDonations': IDL.Nat,
      'totalAmount': IDL.Nat,
      'totalCampaigns': IDL.Nat,
    })], ['query']),
  });
};

const nftCanisterIdl = ({ IDL }: any) => {
  const NFTError = IDL.Variant({
    'TokenNotFound': IDL.Null,
    'Unauthorized': IDL.Null,
    'AlreadyExists': IDL.Null,
    'InvalidMetadata': IDL.Null,
  });

  const NFTMetadata = IDL.Record({
    'tokenId': IDL.Nat,
    'donationId': IDL.Nat,
    'donor': IDL.Principal,
    'campaignId': IDL.Text,
    'amount': IDL.Nat,
    'timestamp': IDL.Int,
    'imageUrl': IDL.Text,
    'attributes': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });

  const Result = (T: any, E: any) => IDL.Variant({ 'ok': T, 'err': E });

  return IDL.Service({
    'mintDonationNFT': IDL.Func([IDL.Nat, IDL.Principal, IDL.Text, IDL.Nat], [Result(IDL.Nat, NFTError)], []),
    'tokenMetadata': IDL.Func([IDL.Nat], [IDL.Opt(NFTMetadata)], ['query']),
    'tokensOf': IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
    'getAllNFTs': IDL.Func([], [IDL.Vec(NFTMetadata)], ['query']),
    'getNFTsByCampaign': IDL.Func([IDL.Text], [IDL.Vec(NFTMetadata)], ['query']),
  });
};

class CanisterService {
  private agent: HttpAgent;
  private donationActor: any;
  private nftActor: any;

  constructor(identity?: any) {
    // Create agent with identity
    this.agent = new HttpAgent({
      host: process.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : 'https://mainnet.dfinity.network',
      identity,
    });

    // Fetch root key for local development
    if (process.env.DFX_NETWORK === 'local') {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }

    // Canister IDs from deployment
    const donationCanisterId = process.env.DFX_NETWORK === 'local' || window.location.hostname.includes('localhost')
      ? 'u6s2n-gx777-77774-qaaba-cai'  // Local deployment ID
      : process.env.CANISTER_ID_DONATION_CANISTER || 'u6s2n-gx777-77774-qaaba-cai';
    
    const nftCanisterId = process.env.DFX_NETWORK === 'local' || window.location.hostname.includes('localhost')
      ? 'uzt4z-lp777-77774-qaabq-cai'  // Local deployment ID
      : process.env.CANISTER_ID_NFT_CANISTER || 'uzt4z-lp777-77774-qaabq-cai';

    // Create actors
    this.donationActor = Actor.createActor(donationCanisterIdl, {
      agent: this.agent,
      canisterId: donationCanisterId,
    });

    this.nftActor = Actor.createActor(nftCanisterIdl, {
      agent: this.agent,
      canisterId: nftCanisterId,
    });
  }

  // Campaign methods
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const result = await this.donationActor.createCampaign(
      data.id,
      data.title,
      data.description,
      data.targetAmount,
      data.endDate ? [data.endDate] : []
    );

    if ('err' in result) {
      throw new Error(result.err);
    }

    return result.ok;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await this.donationActor.getCampaigns();
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const result = await this.donationActor.getCampaign(id);
    return result.length > 0 ? result[0] : null;
  }

  // Donation methods
  async donate(campaignId: string, amount: bigint, txHash?: string): Promise<Donation> {
    const result = await this.donationActor.donate(
      campaignId,
      amount,
      txHash ? [txHash] : []
    );

    if ('err' in result) {
      throw new Error(`Donation failed: ${Object.keys(result.err)[0]}`);
    }

    return result.ok;
  }

  async getDonations(campaignId: string): Promise<Donation[]> {
    return await this.donationActor.getDonations(campaignId);
  }

  async getDonationsByDonor(donor: Principal): Promise<Donation[]> {
    return await this.donationActor.getDonationsByDonor(donor);
  }

  async withdraw(campaignId: string): Promise<bigint> {
    const result = await this.donationActor.withdraw(campaignId);

    if ('err' in result) {
      throw new Error(`Withdrawal failed: ${Object.keys(result.err)[0]}`);
    }

    return result.ok;
  }

  async getTotalStats(): Promise<CampaignStats> {
    return await this.donationActor.getTotalStats();
  }

  // NFT methods
  async mintDonationNFT(donationId: bigint, donor: Principal, campaignId: string, amount: bigint): Promise<bigint> {
    const result = await this.nftActor.mintDonationNFT(donationId, donor, campaignId, amount);

    if ('err' in result) {
      throw new Error(`NFT minting failed: ${Object.keys(result.err)[0]}`);
    }

    return result.ok;
  }

  async getNFTsByOwner(owner: Principal): Promise<bigint[]> {
    return await this.nftActor.tokensOf(owner);
  }

  async getNFTMetadata(tokenId: bigint): Promise<NFTMetadata | null> {
    const result = await this.nftActor.tokenMetadata(tokenId);
    return result.length > 0 ? result[0] : null;
  }

  async getAllNFTs(): Promise<NFTMetadata[]> {
    return await this.nftActor.getAllNFTs();
  }

  async getNFTsByCampaign(campaignId: string): Promise<NFTMetadata[]> {
    return await this.nftActor.getNFTsByCampaign(campaignId);
  }
}

// Singleton pattern for the service
let canisterServiceInstance: CanisterService | null = null;

export const getCanisterService = (identity?: any): CanisterService => {
  if (!canisterServiceInstance || identity) {
    canisterServiceInstance = new CanisterService(identity);
  }
  return canisterServiceInstance;
};

export default CanisterService;
