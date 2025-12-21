import { useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'viem/chains';

export function useChainSwitch(isConnected: boolean) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== sepolia.id) {
      try {
        switchChain({ chainId: sepolia.id });
      } catch (error) {
        console.error('Failed to switch to Sepolia:', error);
      }
    }
  }, [isConnected, chainId, switchChain]);
}

