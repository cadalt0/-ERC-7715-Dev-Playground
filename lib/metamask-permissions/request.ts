/**
 * Permission Request Functions
 */

import { parseUnits } from 'viem';
import { sepolia as chain } from 'viem/chains';
import { setupWalletClient, connectWalletInternal } from './wallet';
import { setupPublicClient, createSessionAccountFromAddress } from './utils';
import { checkAccountUpgrade } from './account';
import { USDC_SEPOLIA } from './constants';

/**
 * Step 5: Request Advanced Permissions
 * Requests ERC-20 periodic transfer permission
 * Exactly as per MetaMask docs Step 5
 */
async function requestPermission(
  walletClient: ReturnType<typeof setupWalletClient>,
  sessionAccount: ReturnType<typeof createSessionAccountFromAddress>
) {
  // Verify wallet client has requestExecutionPermissions method
  if (typeof walletClient.requestExecutionPermissions !== 'function') {
    throw new Error(
      'Wallet client does not have requestExecutionPermissions method. ' +
      'Make sure the wallet client is extended with erc7715ProviderActions() and MetaMask Flask 13.5.0+ is installed. ' +
      'Error: "no middleware configured" usually means MetaMask Flask needs to be restarted or the extension needs to be updated.'
    );
  }

  // Current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  // 1 week from now
  const expiry = currentTime + 604800;

  // Request Advanced Permissions - exactly as per docs Step 5
  try {
    const grantedPermissions = await walletClient.requestExecutionPermissions([
      {
        chainId: chain.id,
        expiry,
        signer: {
          type: 'account',
          data: {
            // The requested permissions will be granted to the session account
            address: sessionAccount.address,
          },
        },
        permission: {
          type: 'erc20-token-periodic',
          data: {
            tokenAddress: USDC_SEPOLIA,
            // 10 USDC in WEI format. Since USDC has 6 decimals, 10 * 10^6
            periodAmount: parseUnits('10', 6),
            // 1 day in seconds
            periodDuration: 86400,
            justification: 'Permission to transfer 10 USDC every day',
          },
        },
        isAdjustmentAllowed: true,
      },
    ]);

    return grantedPermissions[0];
  } catch (error: any) {
    // Handle the "no middleware configured" error specifically
    const errorMessage = error?.message || String(error) || '';
    const errorDetails = error?.details || '';
    
    if (errorMessage.includes('no middleware configured') || 
        errorMessage.includes('not supported') ||
        errorMessage.includes('wallet_requestExecutionPermissions') ||
        errorDetails.includes('no middleware configured')) {
      throw new Error(
        'MetaMask Flask ERC-7715 middleware is not configured. ' +
        'The "no middleware configured" error means Flask needs to be restarted to enable ERC-7715 support. ' +
        'Please: 1) Completely close MetaMask Flask (not just minimize), 2) Restart Flask, 3) Refresh this page, ' +
        '4) Ensure Flask 13.5.0+ is installed. The middleware must be initialized when Flask starts.'
      );
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Main function: Request USDC Periodic Permission
 * Follows the complete flow from MetaMask Smart Accounts Kit documentation
 */
export async function requestUsdcPermission(
  sessionAccountAddress: string, 
  walletClient?: ReturnType<typeof setupWalletClient>,
  userAddress?: string
) {
  // Step 1: Set up Wallet Client (if not provided)
  // MUST be extended with erc7715ProviderActions() for requestExecutionPermissions to work
  const client = walletClient || setupWalletClient();
  
  // Verify the client has requestExecutionPermissions method
  if (typeof client.requestExecutionPermissions !== 'function') {
    throw new Error(
      'Wallet client not properly extended with erc7715ProviderActions(). ' +
      'Make sure MetaMask Flask 13.5.0+ is installed and the wallet client is properly configured.'
    );
  }

  // Step 2: Set up Public Client
  const publicClient = setupPublicClient();

  // Step 3: Set up Session Account (EOA) - only need address for permission requests
  // Private key is only needed for redeeming, not for requesting permissions
  const sessionAccount = createSessionAccountFromAddress(sessionAccountAddress);

  // Step 4: Check the EOA account code - exactly as per docs Step 4
  // Connection happens here via requestAddresses() if address not provided
  let address: string;
  if (userAddress) {
    address = userAddress;
  } else {
    // Step 4 from docs: const addresses = await walletClient.requestAddresses();
    const addresses = await client.requestAddresses();
    address = addresses[0];
    if (!address) {
      throw new Error('No MetaMask account connected');
    }
  }

  // Step 4 continued: Get the EOA account code (exactly as per docs)
  const accountCheck = await checkAccountUpgrade(publicClient, address);

  // With Flask 13.9.0+, if account is not upgraded, it will be upgraded automatically
  // when requesting permissions. So we allow the flow to continue.
  // Only throw error if we explicitly detect it's not the right delegator (older Flask version)
  if (accountCheck.delegatorAddress && !accountCheck.isAccountUpgraded) {
    throw new Error(
      'User account is not upgraded to MetaMask Smart Account. ' +
        'Please upgrade the account in MetaMask Flask or use MetaMask Flask 13.9.0+ which supports automatic upgrade.'
    );
  }

  // Step 5: Request Advanced Permissions
  const grantedPermission = await requestPermission(client, sessionAccount);

  return {
    success: true,
    sessionAccount: {
      address: sessionAccount.address,
    },
    userAccount: {
      address: accountCheck.address,
      isUpgraded: accountCheck.isAccountUpgraded,
    },
    permission: {
      // Hex-encoded permissions context returned by MetaMask
      permissionsContext: (grantedPermission as any).permissionsContext ?? (grantedPermission as any).context,
      delegationManager: grantedPermission.signerMeta?.delegationManager,
    },
    message: 'Permission granted! You can now redeem this permission to execute transfers.',
  };
}

