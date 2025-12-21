import { useState, useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions';
import { connectWallet } from '@/lib/metamask-permissions';
import { wrapEthereumProvider } from '@/lib/utils/provider-wrapper';

export function useWalletClient(isConnected: boolean, connectedAddress: string | undefined, provider: any) {
  const [walletClient, setWalletClient] = useState<any>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    if (isConnected && connectedAddress && provider) {
      const setupWalletClient = async () => {
        setIsSettingUp(true);
        try {
          console.log('Setting up wallet client with Web3Auth provider...');
          
          // Use Web3Auth's provider directly
          const wrappedProvider = wrapEthereumProvider(provider);
          const client = createWalletClient({
            transport: custom(wrappedProvider),
          }).extend(erc7715ProviderActions());

          // Verify the extension worked
          if (typeof client.requestExecutionPermissions !== 'function') {
            throw new Error('Failed to extend wallet client with erc7715ProviderActions()');
          }

          setWalletClient(client);
          console.log('Wallet client set up successfully');
        } catch (error: any) {
          console.error('Wallet client setup failed:', error);
          // Fallback: try using window.ethereum
          try {
            if (typeof window !== 'undefined' && window.ethereum) {
              const result = await connectWallet();
              setWalletClient(result.walletClient);
              console.log('Wallet client set up via fallback method');
            }
          } catch (fallbackError: any) {
            console.error('Fallback wallet client setup also failed:', fallbackError);
          }
        } finally {
          setIsSettingUp(false);
        }
      };
      setupWalletClient();
    } else {
      setWalletClient(null);
      setIsSettingUp(false);
    }
  }, [isConnected, connectedAddress, provider]);

  return { walletClient, isSettingUp };
}

