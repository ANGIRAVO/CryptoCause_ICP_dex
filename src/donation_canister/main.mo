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

actor DonationCanister {
    
    // Types
    public type Result<T, E> = Result.Result<T, E>;
    
    public type Donation = {
        id: Nat;
        donor: Principal;
        campaignId: Text;
        amount: Nat;
        timestamp: Int;
        txHash: ?Text;
    };
    
    public type Campaign = {
        id: Text;
        title: Text;
        description: Text;
        recipient: Principal;
        targetAmount: Nat;
        currentAmount: Nat;
        isActive: Bool;
        createdAt: Int;
        endDate: ?Int;
        withdrawable: Bool;
    };
    
    public type DonationError = {
        #CampaignNotFound;
        #InsufficientAmount;
        #CampaignInactive;
        #Unauthorized;
        #TransferFailed;
    };

    // State
    private stable var nextDonationId: Nat = 0;
    private stable var campaignEntries: [(Text, Campaign)] = [];
    private stable var donationEntries: [(Nat, Donation)] = [];
    
    private var campaigns = HashMap.fromIter<Text, Campaign>(
        campaignEntries.vals(), campaignEntries.size(), Text.equal, Text.hash
    );
    
    private var donations = HashMap.fromIter<Nat, Donation>(
        donationEntries.vals(), donationEntries.size(), Nat.equal, func(n: Nat): Nat32 { Nat32.fromNat(n) }
    );

    // Admin principal (deployer) - will be set during deployment
    private stable var admin: Principal = Principal.fromText("2vxsx-fae"); // Anonymous principal as default

    // ICRC-1 Token Canister ID for ckUSDT - will be configured later
    private stable var ckUSDT_CANISTER: Principal = Principal.fromText("2vxsx-fae"); // Anonymous principal as placeholder

    // System functions
    system func preupgrade() {
        campaignEntries := Iter.toArray(campaigns.entries());
        donationEntries := Iter.toArray(donations.entries());
    };

    system func postupgrade() {
        campaignEntries := [];
        donationEntries := [];
    };

    // Create a new campaign
    public shared(msg) func createCampaign(
        id: Text,
        title: Text, 
        description: Text,
        targetAmount: Nat,
        endDate: ?Int
    ): async Result<Campaign, Text> {
        
        let campaign: Campaign = {
            id = id;
            title = title;
            description = description;
            recipient = msg.caller;
            targetAmount = targetAmount;
            currentAmount = 0;
            isActive = true;
            createdAt = Time.now();
            endDate = endDate;
            withdrawable = false;
        };
        
        campaigns.put(id, campaign);
        #ok(campaign)
    };

    // Get all campaigns
    public query func getCampaigns(): async [Campaign] {
        Iter.toArray(campaigns.vals())
    };

    // Get specific campaign
    public query func getCampaign(id: Text): async ?Campaign {
        campaigns.get(id)
    };

    // Make a donation
    public shared(msg) func donate(
        campaignId: Text, 
        amount: Nat,
        txHash: ?Text
    ): async Result<Donation, DonationError> {
        
        switch (campaigns.get(campaignId)) {
            case null { #err(#CampaignNotFound) };
            case (?campaign) {
                if (not campaign.isActive) {
                    return #err(#CampaignInactive);
                };
                
                if (amount == 0) {
                    return #err(#InsufficientAmount);
                };

                // Create donation record
                let donation: Donation = {
                    id = nextDonationId;
                    donor = msg.caller;
                    campaignId = campaignId;
                    amount = amount;
                    timestamp = Time.now();
                    txHash = txHash;
                };
                
                donations.put(nextDonationId, donation);
                nextDonationId += 1;
                
                // Update campaign amount
                let updatedCampaign: Campaign = {
                    campaign with 
                    currentAmount = campaign.currentAmount + amount;
                    withdrawable = campaign.currentAmount + amount >= campaign.targetAmount;
                };
                
                campaigns.put(campaignId, updatedCampaign);
                
                #ok(donation)
            };
        }
    };

    // Get donations for a campaign
    public query func getDonations(campaignId: Text): async [Donation] {
        let allDonations = Iter.toArray(donations.vals());
        Array.filter<Donation>(allDonations, func(d: Donation): Bool {
            d.campaignId == campaignId
        })
    };

    // Get donations by donor
    public query func getDonationsByDonor(donor: Principal): async [Donation] {
        let allDonations = Iter.toArray(donations.vals());
        Array.filter<Donation>(allDonations, func(d: Donation): Bool {
            d.donor == donor
        })
    };

    // Withdraw funds (only campaign recipient)
    public shared(msg) func withdraw(campaignId: Text): async Result<Nat, DonationError> {
        switch (campaigns.get(campaignId)) {
            case null { #err(#CampaignNotFound) };
            case (?campaign) {
                if (campaign.recipient != msg.caller) {
                    return #err(#Unauthorized);
                };
                
                if (not campaign.withdrawable) {
                    return #err(#InsufficientAmount);
                };
                
                let withdrawAmount = campaign.currentAmount;
                
                // Update campaign to withdrawn state
                let updatedCampaign: Campaign = {
                    campaign with 
                    currentAmount = 0;
                    withdrawable = false;
                    isActive = false;
                };
                
                campaigns.put(campaignId, updatedCampaign);
                
                #ok(withdrawAmount)
            };
        }
    };

    // Admin function to update campaign status
    public shared(msg) func updateCampaignStatus(campaignId: Text, isActive: Bool): async Result<(), Text> {
        if (msg.caller != admin) {
            return #err("Unauthorized");
        };
        
        switch (campaigns.get(campaignId)) {
            case null { #err("Campaign not found") };
            case (?campaign) {
                let updatedCampaign: Campaign = {
                    campaign with isActive = isActive;
                };
                campaigns.put(campaignId, updatedCampaign);
                #ok()
            };
        }
    };

    // Get total donation stats
    public query func getTotalStats(): async {totalDonations: Nat; totalAmount: Nat; totalCampaigns: Nat} {
        let allDonations = Iter.toArray(donations.vals());
        let totalAmount = Array.foldLeft<Donation, Nat>(allDonations, 0, func(acc, donation) {
            acc + donation.amount
        });
        
        {
            totalDonations = allDonations.size();
            totalAmount = totalAmount;
            totalCampaigns = campaigns.size();
        }
    };
}
