import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Option "mo:base/Option";

actor DonationNFT {
    
    // Types
    public type Result<T, E> = Result.Result<T, E>;
    
    public type TokenId = Nat;
    
    public type NFTMetadata = {
        tokenId: TokenId;
        donationId: Nat;
        donor: Principal;
        campaignId: Text;
        amount: Nat;
        timestamp: Int;
        imageUrl: Text;
        attributes: [(Text, Text)];
    };
    
    public type NFTError = {
        #TokenNotFound;
        #Unauthorized;
        #AlreadyExists;
        #InvalidMetadata;
    };

    // State
    private stable var nextTokenId: TokenId = 1;
    private stable var nftEntries: [(TokenId, NFTMetadata)] = [];
    private stable var ownerEntries: [(TokenId, Principal)] = [];
    private stable var approvalEntries: [(TokenId, Principal)] = [];
    
    private var nfts = HashMap.fromIter<TokenId, NFTMetadata>(
        nftEntries.vals(), nftEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n) }
    );
    
    private var owners = HashMap.fromIter<TokenId, Principal>(
        ownerEntries.vals(), ownerEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n) }
    );
    
    private var approvals = HashMap.fromIter<TokenId, Principal>(
        approvalEntries.vals(), approvalEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n) }
    );

    // Admin/Donation canister principal - will be set after deployment
    private stable var donationCanister: Principal = Principal.fromText("2vxsx-fae"); // Anonymous principal as placeholder

    // System functions
    system func preupgrade() {
        nftEntries := Iter.toArray(nfts.entries());
        ownerEntries := Iter.toArray(owners.entries());
        approvalEntries := Iter.toArray(approvals.entries());
    };

    system func postupgrade() {
        nftEntries := [];
        ownerEntries := [];
        approvalEntries := [];
    };

    // Mint NFT for donation (only callable by donation canister)
    public shared(msg) func mintDonationNFT(
        donationId: Nat,
        donor: Principal,
        campaignId: Text,
        amount: Nat
    ): async Result<TokenId, NFTError> {
        
        if (msg.caller != donationCanister) {
            return #err(#Unauthorized);
        };
        
        let tokenId = nextTokenId;
        nextTokenId += 1;
        
        let metadata: NFTMetadata = {
            tokenId = tokenId;
            donationId = donationId;
            donor = donor;
            campaignId = campaignId;
            amount = amount;
            timestamp = Time.now();
            imageUrl = "https://charity-dapp.com/nft/" # Nat.toText(tokenId) # ".png";
            attributes = [
                ("Donation Amount", Nat.toText(amount) # " ckUSDT"),
                ("Campaign", campaignId),
                ("Date", Int.toText(Time.now())),
                ("Type", "Donation Receipt")
            ];
        };
        
        nfts.put(tokenId, metadata);
        owners.put(tokenId, donor);
        
        #ok(tokenId)
    };

    // Get NFT metadata
    public query func tokenMetadata(tokenId: TokenId): async ?NFTMetadata {
        nfts.get(tokenId)
    };

    // Get owner of token
    public query func ownerOf(tokenId: TokenId): async ?Principal {
        owners.get(tokenId)
    };

    // Get tokens owned by principal
    public query func tokensOf(owner: Principal): async [TokenId] {
        let allTokens = Iter.toArray(owners.entries());
        let ownerTokens = Array.filter<(TokenId, Principal)>(allTokens, func((id, p)) {
            Principal.equal(p, owner)
        });
        Array.map<(TokenId, Principal), TokenId>(ownerTokens, func((id, _)) { id })
    };

    // Get total supply
    public query func totalSupply(): async Nat {
        nfts.size()
    };

    // Transfer token
    public shared(msg) func transfer(tokenId: TokenId, to: Principal): async Result<(), NFTError> {
        switch (owners.get(tokenId)) {
            case null { #err(#TokenNotFound) };
            case (?owner) {
                if (owner != msg.caller) {
                    // Check if caller is approved
                    switch (approvals.get(tokenId)) {
                        case null { return #err(#Unauthorized) };
                        case (?approved) {
                            if (approved != msg.caller) {
                                return #err(#Unauthorized);
                            };
                        };
                    };
                };
                
                owners.put(tokenId, to);
                approvals.delete(tokenId);
                #ok()
            };
        }
    };

    // Approve another principal to transfer token
    public shared(msg) func approve(tokenId: TokenId, approved: Principal): async Result<(), NFTError> {
        switch (owners.get(tokenId)) {
            case null { #err(#TokenNotFound) };
            case (?owner) {
                if (owner != msg.caller) {
                    return #err(#Unauthorized);
                };
                
                approvals.put(tokenId, approved);
                #ok()
            };
        }
    };

    // Get approved principal for token
    public query func getApproved(tokenId: TokenId): async ?Principal {
        approvals.get(tokenId)
    };

    // Get all NFTs with metadata (for UI display)
    public query func getAllNFTs(): async [NFTMetadata] {
        Iter.toArray(nfts.vals())
    };

    // Get NFTs by campaign
    public query func getNFTsByCampaign(campaignId: Text): async [NFTMetadata] {
        let allNFTs = Iter.toArray(nfts.vals());
        Array.filter<NFTMetadata>(allNFTs, func(nft: NFTMetadata): Bool {
            nft.campaignId == campaignId
        })
    };
} 