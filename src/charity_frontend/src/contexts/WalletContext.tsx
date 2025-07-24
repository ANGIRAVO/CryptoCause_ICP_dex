import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { WalletInfo } from '../types';

interface WalletContextType {
  wallet: WalletInfo;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo>({
    principal: null,
    isConnected: false,
    balance: BigInt(0),
    identity: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        
        setWallet({
          principal,
          isConnected: true,
          balance: BigInt(0), // Will be updated when we fetch actual balance
          identity,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // For local development, create a test identity
      if (process.env.DFX_NETWORK === 'local' || window.location.hostname === 'localhost' || window.location.hostname.includes('localhost')) {
        // Create a random test identity for local development
        const identity = Ed25519KeyIdentity.generate();
        const principal = identity.getPrincipal();
        
        setWallet({
          principal,
          isConnected: true,
          balance: BigInt(0),
          identity,
        });
        
        console.log('Connected with test identity:', principal.toString());
        return;
      }
      
      // For production, use Internet Identity
      if (!authClient) return;
      
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          
          setWallet({
            principal,
            isConnected: true,
            balance: BigInt(0),
            identity,
          });
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (!authClient) return;
    
    try {
      setIsLoading(true);
      await authClient.logout();
      
      setWallet({
        principal: null,
        isConnected: false,
        balance: BigInt(0),
        identity: null,
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    isLoading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
