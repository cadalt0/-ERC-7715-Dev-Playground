/**
 * Wallet Client Setup and Connection Functions
 */

import { createWalletClient, custom } from 'viem';
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions';
import { wrapEthereumProvider } from './utils';

/**
 * Step 1: Set up Wallet Client
 * Creates a Viem Wallet Client extended with erc7715ProviderActions
 * Exactly as per MetaMask docs Step 1
 */
export function setupWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask Flask (window.ethereum) not found. Please install MetaMask Flask.');
  }

  // Check if Flask has ERC-7715 middleware enabled
  // The middleware should be available if Flask 13.5.0+ is properly installed
  try {
    const wrappedProvider = wrapEthereumProvider(window.ethereum);
    const walletClient = createWalletClient({
      transport: custom(wrappedProvider),
    }).extend(erc7715ProviderActions());

    // Verify the extension worked
    if (typeof walletClient.requestExecutionPermissions !== 'function') {
      throw new Error(
        'ERC-7715 middleware not configured in MetaMask Flask. ' +
        'Please ensure Flask 13.5.0+ is installed and restart Flask completely.'
      );
    }

    return walletClient;
  } catch (error: any) {
    if (error?.message?.includes('no middleware configured') || error?.message?.includes('not supported')) {
      throw new Error(
        'MetaMask Flask ERC-7715 middleware is not configured. ' +
        'Please: 1) Restart MetaMask Flask completely, 2) Refresh this page, 3) Ensure Flask 13.5.0+ is installed. ' +
        'The "no middleware configured" error means Flask needs to be restarted to enable ERC-7715 support.'
      );
    }
    throw error;
  }
}

/**
 * Connect Wallet - Exported function
 * Step 1: Set up Wallet Client exactly as per docs
 * Then requests addresses (connection happens here as per Step 4 in docs)
 */
export async function connectWallet() {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in the browser.');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask Flask (window.ethereum) not found. Please install MetaMask Flask extension.');
  }

  try {
    // Step 1: Set up Wallet Client exactly as per docs
    // IMPORTANT: Must extend with erc7715ProviderActions() to enable requestExecutionPermissions
    const wrappedProvider = wrapEthereumProvider(window.ethereum);
    const walletClient = createWalletClient({
      transport: custom(wrappedProvider),
    }).extend(erc7715ProviderActions());

    // Verify the extension worked - check if requestExecutionPermissions exists
    if (typeof walletClient.requestExecutionPermissions !== 'function') {
      throw new Error(
        'Failed to extend wallet client with erc7715ProviderActions(). ' +
        'The "no middleware configured" error means MetaMask Flask ERC-7715 middleware is not enabled. ' +
        'Try: 1) Restart MetaMask Flask, 2) Refresh the page, 3) Make sure Flask 13.5.0+ is installed.'
      );
    }

    // Step 4: Check EOA account code - connection happens here via requestAddresses()
    // This is exactly as shown in the docs Step 4
    const addresses = await walletClient.requestAddresses();
    const address = addresses[0];

    if (!address) {
      throw new Error('No accounts found. Please connect your MetaMask Flask wallet.');
    }

    return {
      address,
      walletClient, // Return the extended wallet client for later use
    };
  } catch (error: any) {
    console.error('Connect wallet error:', error);
    
    if (error?.code === 4001) {
      throw new Error('User rejected the connection request. Please approve the connection in MetaMask Flask.');
    }
    
    if (error?.message) {
      throw error;
    }
    
    throw new Error(`Failed to connect wallet: ${error?.message || String(error)}`);
  }
}

/**
 * Step 1.5: Connect Wallet (internal)
 * Requests connection to MetaMask Flask and gets user's address
 */
export async function connectWalletInternal(
  walletClient: ReturnType<typeof setupWalletClient>
) {
  try {
    // Request addresses - this will prompt user to connect if not already connected
    const addresses = await walletClient.requestAddresses();
    
    if (!addresses || addresses.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask Flask wallet.');
    }

    return addresses[0];
  } catch (error: any) {
    if (error?.code === 4001) {
      throw new Error('User rejected the connection request. Please connect your wallet to continue.');
    }
    throw new Error(`Failed to connect wallet: ${error?.message || String(error)}`);
  }
}

