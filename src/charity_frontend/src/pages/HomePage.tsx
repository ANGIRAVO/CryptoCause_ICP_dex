import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { getCanisterService } from '../services/canisterService';
import { Campaign, CampaignStats } from '../types';

const HomePage: React.FC = () => {
  const { wallet } = useWallet();
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const canisterService = getCanisterService(wallet.identity);
      
      try {
        const [statsData, campaigns] = await Promise.all([
          canisterService.getTotalStats(),
          canisterService.getCampaigns()
        ]);
        
        setStats(statsData);
        // Show top 3 campaigns by progress
        const sortedCampaigns = campaigns
          .filter(c => c.isActive)
          .sort((a, b) => {
            const progressA = Number(a.currentAmount) / Number(a.targetAmount);
            const progressB = Number(b.currentAmount) / Number(b.targetAmount);
            return progressB - progressA;
          })
          .slice(0, 3);
        
        setFeaturedCampaigns(sortedCampaigns);
      } catch (backendError) {
        console.log('Backend not ready or no campaigns yet:', backendError);
        // Set default data for UI testing
        setStats({
          totalDonations: BigInt(0),
          totalAmount: BigInt(0),
          totalCampaigns: BigInt(0),
        });
        setFeaturedCampaigns([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getProgress = (current: bigint, target: bigint) => {
    return (Number(current) / Number(target)) * 100;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Saweria Style */}
      <section className="bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Support creators you love ❤️
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Send crypto donations to creators with ckUSDT on Internet Computer. 
            100% transparent, low fees, instant delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link to="/campaigns" className="bg-white text-orange-500 hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-colors shadow-lg">
              ✨ Discover Creators
            </Link>
            <Link to="/create-campaign" className="bg-white/20 hover:bg-white/30 backdrop-blur font-semibold py-3 px-6 rounded-full transition-colors border border-white/30">
              🚀 Start Receiving
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Difference Together</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of donors who are creating positive change through transparent blockchain donations.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-8 text-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4 loading-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2 loading-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded loading-pulse"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card p-8 text-center">
                <div className="w-12 h-12 bg-charity-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-charity-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {formatAmount(stats.totalAmount)} ckUSDT
                </h3>
                <p className="text-gray-600">Total Donated</p>
              </div>
              
              <div className="card p-8 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {Number(stats.totalDonations).toLocaleString()}
                </h3>
                <p className="text-gray-600">Total Donations</p>
              </div>
              
              <div className="card p-8 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {Number(stats.totalCampaigns).toLocaleString()}
                </h3>
                <p className="text-gray-600">Active Campaigns</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">✨ Featured Creators</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Support amazing creators who are building the future
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4 loading-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 loading-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 loading-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded loading-pulse"></div>
                </div>
              ))}
            </div>
                     ) : featuredCampaigns.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {featuredCampaigns.map((campaign) => (
                 <div key={campaign.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:-translate-y-1">
                   {/* Creator Avatar */}
                   <div className="flex items-center mb-4">
                     <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                       {campaign.title.charAt(0)}
                     </div>
                     <div className="ml-3">
                       <h3 className="font-semibold text-gray-900 text-lg">{campaign.title}</h3>
                       <p className="text-gray-500 text-sm">Creator</p>
                     </div>
                   </div>
                   
                   <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">{campaign.description}</p>
                   
                   {/* Stats */}
                   <div className="bg-gray-50 rounded-xl p-3 mb-4">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm text-gray-600">Raised</span>
                       <span className="font-semibold text-gray-900">{formatAmount(campaign.currentAmount)} ckUSDT</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                         style={{ width: `${Math.min(getProgress(campaign.currentAmount, campaign.targetAmount), 100)}%` }}
                       ></div>
                     </div>
                     <div className="text-xs text-gray-500 mt-1">
                       Goal: {formatAmount(campaign.targetAmount)} ckUSDT
                     </div>
                   </div>
                   
                   <Link 
                     to={`/campaigns/${campaign.id}`}
                     className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-orange-500 hover:to-pink-600 transition-all duration-200 text-center block"
                   >
                     💝 Support Creator
                   </Link>
                 </div>
               ))}
             </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No campaigns available yet.</p>
              <Link to="/create-campaign" className="btn-primary">
                Create the First Campaign
              </Link>
            </div>
          )}
          
          {featuredCampaigns.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/campaigns" className="btn-secondary">
                View All Campaigns
              </Link>
            </div>
          )}
        </div>
      </section>

             {/* Features Section - Saweria Style */}
       <section className="py-12 bg-gray-50">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-10">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">💫 Why creators love us</h2>
             <p className="text-gray-600 max-w-xl mx-auto">
               The easiest way to receive support from your community
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-2xl p-6 border border-gray-100">
               <div className="flex items-start">
                 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                   <span className="text-2xl">⚡</span>
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant & Transparent</h3>
                   <p className="text-gray-600 text-sm">Every donation is recorded on blockchain. No hidden fees, no delays.</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl p-6 border border-gray-100">
               <div className="flex items-start">
                 <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
                   <span className="text-2xl">💎</span>
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">NFT Receipts</h3>
                   <p className="text-gray-600 text-sm">Supporters get unique NFTs as proof of their contribution.</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl p-6 border border-gray-100">
               <div className="flex items-start">
                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                   <span className="text-2xl">🌍</span>
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Payments</h3>
                   <p className="text-gray-600 text-sm">Receive support from anywhere in the world with ckUSDT.</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl p-6 border border-gray-100">
               <div className="flex items-start">
                 <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                   <span className="text-2xl">🔒</span>
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                   <p className="text-gray-600 text-sm">Built on Internet Computer with enterprise-grade security.</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

             {/* CTA Section - Saweria Style */}
       <section className="py-16 gradient-bg text-white">
         <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
           <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to start receiving support? 🚀</h2>
           <p className="text-lg mb-8 text-white/90">
             Join thousands of creators already using CharityChain to monetize their passion
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
             {wallet.isConnected ? (
               <>
                 <Link to="/campaigns" className="bg-white text-orange-500 hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-colors shadow-lg">
                   ✨ Explore Creators
                 </Link>
                 <Link to="/create-campaign" className="bg-white/20 hover:bg-white/30 backdrop-blur font-semibold py-3 px-6 rounded-full transition-colors border border-white/30">
                   🎯 Start My Page
                 </Link>
               </>
             ) : (
               <div className="bg-white/20 backdrop-blur font-semibold py-3 px-6 rounded-full border border-white/30">
                 Connect your wallet to get started ⭐
               </div>
             )}
           </div>
         </div>
       </section>
    </div>
  );
};

export default HomePage;
