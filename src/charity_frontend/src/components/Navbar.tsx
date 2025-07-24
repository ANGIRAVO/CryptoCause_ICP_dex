import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const Navbar: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, isLoading } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">❤️</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">CryptoCause</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🏠 Home
              </Link>
              <Link
                to="/campaigns"
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/campaigns')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                ✨ Creators
              </Link>
              <Link
                to="/create-campaign"
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/create-campaign')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🚀 Start
              </Link>
              {wallet.isConnected && (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to="/nfts"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/nfts')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    🎨 My NFTs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Wallet connection */}
          <div className="flex items-center space-x-4">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrincipal(wallet.principal?.toString() || '')}
                  </span>
                  <span className="text-xs text-gray-500">
                    Balance: {wallet.balance.toString()} ckUSDT
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  {isLoading ? '⏳' : '👋 Disconnect'}
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold px-4 py-2 rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-200 text-sm"
              >
                {isLoading ? '⏳ Connecting...' : '🔗 Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/campaigns')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Campaigns
          </Link>
          <Link
            to="/create-campaign"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/create-campaign')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Create Campaign
          </Link>
          {wallet.isConnected && (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/nfts"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/nfts')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                My NFTs
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
