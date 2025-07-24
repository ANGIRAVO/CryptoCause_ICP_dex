import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// ICRC-1 Token Standard Interface
const icrc1Idl = ({ IDL }: any) => {
  const Value = IDL.Rec();
  Value.fill(
    IDL.Variant({
      'Blob': IDL.Vec(IDL.Nat8),
      'Text': IDL.Text,
      'Nat': IDL.Nat,
      'Int': IDL.Int,
      'Array': IDL.Vec(Value),
      'Map': IDL.Vec(IDL.Tuple(IDL.Text, Value)),
    })
  );

  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });

  const TransferArg = IDL.Record({
    'to': Account,
    'fee': IDL.Opt(IDL.Nat),
    'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time': IDL.Opt(IDL.Nat64),
    'amount': IDL.Nat,
  });

  const TransferError = IDL.Variant({
    'GenericError': IDL.Record({
      'message': IDL.Text,
      'error_code': IDL.Nat,
    }),
    'TemporarilyUnavailable': IDL.Null,
    'BadBurn': IDL.Record({ 'min_burn_amount': IDL.Nat }),
    'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
    'BadFee': IDL.Record({ 'expected_fee': IDL.Nat }),
    'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
    'TooOld': IDL.Null,
    'InsufficientFunds': IDL.Record({ 'balance': IDL.Nat }),
  });

  const Result = IDL.Variant({ 'Ok': IDL.Nat, 'Err': TransferError });

  const ApproveArgs = IDL.Record({
    'fee': IDL.Opt(IDL.Nat),
    'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time': IDL.Opt(IDL.Nat64),
    'amount': IDL.Nat,
    'expected_allowance': IDL.Opt(IDL.Nat),
    'expires_at': IDL.Opt(IDL.Nat64),
    'spender': Account,
  });

  const ApproveError = IDL.Variant({
    'GenericError': IDL.Record({
      'message': IDL.Text,
      'error_code': IDL.Nat,
    }),
    'TemporarilyUnavailable': IDL.Null,
    'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
    'BadFee': IDL.Record({ 'expected_fee': IDL.Nat }),
    'AllowanceChanged': IDL.Record({ 'current_allowance': IDL.Nat }),
    'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
    'TooOld': IDL.Null,
    'Expired': IDL.Record({ 'ledger_time': IDL.Nat64 }),
    'InsufficientFunds': IDL.Record({ 'balance': IDL.Nat }),
  });

  const ApproveResult = IDL.Variant({ 'Ok': IDL.Nat, 'Err': ApproveError });

  return IDL.Service({
    'icrc1_name': IDL.Func([], [IDL.Text], ['query']),
    'icrc1_symbol': IDL.Func([], [IDL.Text], ['query']),
    'icrc1_decimals': IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee': IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_metadata': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, Value))], ['query']),
    'icrc1_total_supply': IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_minting_account': IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_transfer': IDL.Func([TransferArg], [Result], []),
    'icrc2_approve': IDL.Func([ApproveArgs], [ApproveResult], []),
    'icrc2_allowance': IDL.Func([IDL.Record({
      'account': Account,
      'spender': Account,
    })], [IDL.Record({
      'allowance': IDL.Nat,
      'expires_at': IDL.Opt(IDL.Nat64),
    })], ['query']),
  });
};

export class CkUSDTService {
  private agent: HttpAgent;
  private tokenActor: any;
  private canisterId: Principal;

  constructor(identity?: any) {
    // ckUSDT canister ID (you'll need to replace this with the actual ckUSDT canister ID)
    this.canisterId = Principal.fromText(process.env.CKUSDT_CANISTER_ID || 'xkbqi-6qaaa-aaaah-qbpqq-cai');
    
    this.agent = new HttpAgent({
      host: process.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : 'https://mainnet.dfinity.network',
      identity,
    });

    if (process.env.DFX_NETWORK === 'local') {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }

    this.tokenActor = Actor.createActor(icrc1Idl, {
      agent: this.agent,
      canisterId: this.canisterId,
    });
  }

  // Get token balance for an account
  async getBalance(principal: Principal): Promise<bigint> {
    const account = {
      owner: principal,
      subaccount: [],
    };
    return await this.tokenActor.icrc1_balance_of(account);
  }

  // Get token metadata
  async getTokenInfo() {
    const [name, symbol, decimals, fee, totalSupply] = await Promise.all([
      this.tokenActor.icrc1_name(),
      this.tokenActor.icrc1_symbol(),
      this.tokenActor.icrc1_decimals(),
      this.tokenActor.icrc1_fee(),
      this.tokenActor.icrc1_total_supply(),
    ]);

    return { name, symbol, decimals, fee, totalSupply };
  }

  // Transfer tokens
  async transfer(to: Principal, amount: bigint, memo?: Uint8Array): Promise<bigint> {
    const transferArg = {
      to: {
        owner: to,
        subaccount: [],
      },
      fee: [],
      memo: memo ? [memo] : [],
      from_subaccount: [],
      created_at_time: [],
      amount,
    };

    const result = await this.tokenActor.icrc1_transfer(transferArg);
    
    if ('Err' in result) {
      const error = Object.keys(result.Err)[0];
      throw new Error(`Transfer failed: ${error}`);
    }

    return result.Ok;
  }

  // Approve spending (for contract interactions)
  async approve(spender: Principal, amount: bigint, expiresAt?: bigint): Promise<bigint> {
    const approveArgs = {
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount,
      expected_allowance: [],
      expires_at: expiresAt ? [expiresAt] : [],
      spender: {
        owner: spender,
        subaccount: [],
      },
    };

    const result = await this.tokenActor.icrc2_approve(approveArgs);
    
    if ('Err' in result) {
      const error = Object.keys(result.Err)[0];
      throw new Error(`Approval failed: ${error}`);
    }

    return result.Ok;
  }

  // Check allowance
  async getAllowance(owner: Principal, spender: Principal): Promise<{ allowance: bigint; expiresAt?: bigint }> {
    const result = await this.tokenActor.icrc2_allowance({
      account: {
        owner,
        subaccount: [],
      },
      spender: {
        owner: spender,
        subaccount: [],
      },
    });

    return {
      allowance: result.allowance,
      expiresAt: result.expires_at.length > 0 ? result.expires_at[0] : undefined,
    };
  }

  // Utility function to format token amount (considering decimals)
  static formatAmount(amount: bigint, decimals: number = 6): string {
    const divisor = BigInt(10 ** decimals);
    const major = amount / divisor;
    const minor = amount % divisor;
    
    if (minor === BigInt(0)) {
      return major.toString();
    }
    
    const minorStr = minor.toString().padStart(decimals, '0');
    const trimmedMinor = minorStr.replace(/0+$/, '');
    
    return `${major}.${trimmedMinor}`;
  }

  // Utility function to parse token amount string to bigint
  static parseAmount(amountStr: string, decimals: number = 6): bigint {
    const parts = amountStr.split('.');
    const major = BigInt(parts[0] || '0');
    const minor = parts[1] || '';
    
    const paddedMinor = minor.padEnd(decimals, '0').slice(0, decimals);
    const minorBigInt = BigInt(paddedMinor);
    
    return major * BigInt(10 ** decimals) + minorBigInt;
  }
}

// Singleton pattern
let ckUSDTServiceInstance: CkUSDTService | null = null;

export const getCkUSDTService = (identity?: any): CkUSDTService => {
  if (!ckUSDTServiceInstance || identity) {
    ckUSDTServiceInstance = new CkUSDTService(identity);
  }
  return ckUSDTServiceInstance;
};

export default CkUSDTService;
