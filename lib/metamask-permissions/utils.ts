/**
 * Utility functions for MetaMask Permissions
 */

import { createPublicClient, http } from 'viem';
import { sepolia as chain } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Wrap ethereum provider to add missing methods for viem compatibility
 */
export function wrapEthereumProvider(provider: any) {
  if (!provider) return provider;
  
  // If provider already has addListener, return as-is
  if (provider.addListener && provider.removeListener) {
    return provider;
  }
  
  // Create a wrapped provider that adds missing methods
  return new Proxy(provider, {
    get(target, prop) {
      if (prop === 'addListener' && !target.addListener) {
        return target.on || (() => {});
      }
      if (prop === 'removeListener' && !target.removeListener) {
        return target.off || (() => {});
      }
      return target[prop as keyof typeof target];
    },
  });
}

/**
 * Step 2: Set up Public Client
 * Creates a Viem Public Client exactly as per MetaMask docs
 */
export function setupPublicClient() {
  // Use reliable RPC endpoint with fallback
  const customRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  const rpcUrl = customRpcUrl || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl, {
      timeout: 10000, // 10 second timeout
      retryCount: 2,
      retryDelay: 1000,
    }),
  });

  return publicClient;
}

/**
 * Step 3: Set up Session Account (EOA)
 * Creates an EOA session account exactly as per MetaMask docs
 * Using privateKeyToAccount from viem/accounts
 */
export function setupSessionAccount(privateKey: string) {
  // Exactly as shown in docs: const sessionAccount = privateKeyToAccount("0x...");
  const sessionAccount = privateKeyToAccount(privateKey as `0x${string}`);
  return sessionAccount;
}

/**
 * Create a session account object from address only (for permission requests)
 * Private key is not needed for requesting permissions, only for redeeming
 */
export function createSessionAccountFromAddress(address: string) {
  // Create a minimal account object with just the address
  // This is sufficient for permission requests
  return {
    address: address as `0x${string}`,
  } as any;
}

