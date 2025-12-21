import { useState, useEffect } from 'react';

export interface SessionAccountInfo {
  address: string;
  balance: string;
  balanceEth: string;
  estimatedGasCostEth: string;
  isLowBalance: boolean;
  warning: string | null;
  error?: string;
  rpcError?: boolean;
}

export function useSessionAccount() {
  const [sessionAccountInfo, setSessionAccountInfo] = useState<SessionAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get session account address and balance from backend API
      // Backend derives it from SESSION_PRIVATE_KEY, never exposes the private key
      const fetchSessionAccount = async () => {
        try {
          const response = await fetch('/api/session-account');
          const data = await response.json();
          
          if (response.ok && data.address) {
            setSessionAccountInfo({
              address: data.address,
              balance: data.balance,
              balanceEth: data.balanceEth,
              estimatedGasCostEth: data.estimatedGasCostEth,
              isLowBalance: data.isLowBalance,
              warning: data.warning,
              error: data.error,
              rpcError: data.rpcError,
            });
            console.log('Session account loaded from backend:', {
              address: data.address,
              balance: `${data.balanceEth} ETH`,
              isLowBalance: data.isLowBalance,
            });
          } else {
            setError(data.error || 'Failed to load session account');
            console.error('Failed to load session account:', data.error);
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to fetch session account');
          console.error('Error fetching session account:', e);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSessionAccount();
    }
  }, []);

  return { 
    sessionAccountAddress: sessionAccountInfo?.address || null,
    sessionAccountInfo,
    isLoading, 
    error 
  };
}

