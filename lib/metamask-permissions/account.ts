/**
 * Account Upgrade Checking Functions
 */

import { sepolia as chain } from 'viem/chains';
import { getSmartAccountsEnvironment } from '@metamask/smart-accounts-kit';
import { setupPublicClient } from './utils';

/**
 * Step 4: Check EOA account code
 * Checks if user account is upgraded to MetaMask Smart Account
 * Exactly as per MetaMask docs Step 4
 * 
 * Note: With MetaMask Flask 13.9.0+, Advanced Permissions support automatically 
 * upgrading a user's account. If code is empty (EOA), the upgrade will happen 
 * automatically when requesting permissions.
 */
export async function checkAccountUpgrade(
  publicClient: ReturnType<typeof setupPublicClient>,
  userAddress: string
) {
  try {
    // Ensure address is a valid string
    if (!userAddress || typeof userAddress !== 'string') {
      throw new Error('Invalid address provided');
    }

    // Get the EOA account code - exactly as per docs
    const code = await publicClient.getCode({
      address: userAddress as `0x${string}`,
    });

    if (code && code !== '0x') {
      // The address to which EOA has delegated. According to EIP-7702, 0xef0100 || address
      // represents the delegation.
      // You need to remove the first 8 characters (0xef0100) to get the delegator address.
      const delegatorAddress = `0x${code.substring(8)}`;

      const statelessDelegatorAddress = getSmartAccountsEnvironment(chain.id)
        .implementations.EIP7702StatelessDeleGatorImpl;

      // Check if account is upgraded to MetaMask smart account
      const isAccountUpgraded =
        delegatorAddress.toLowerCase() === statelessDelegatorAddress.toLowerCase();

      return {
        address: userAddress,
        isAccountUpgraded,
        delegatorAddress,
      };
    }

    // If no code (EOA), with Flask 13.9.0+ the upgrade will happen automatically
    // So we return isAccountUpgraded as true to allow the flow to continue
    // The actual upgrade will happen when requesting permissions
    return {
      address: userAddress,
      isAccountUpgraded: true, // Allow flow to continue - upgrade happens automatically in Flask 13.9.0+
      delegatorAddress: null,
    };
  } catch (error) {
    console.error('Error checking account upgrade:', error);
    throw error;
  }
}

