/**
 * Customizable Permission Request Functions
 */

import { parseUnits, parseEther } from 'viem';
import { setupWalletClient } from './wallet';
import { setupPublicClient, createSessionAccountFromAddress } from './utils';
import { checkAccountUpgrade } from './account';
import { PermissionConfig } from './types';

/**
 * Request customizable ERC-7715 advanced permission
 */
export async function requestCustomPermission(
  config: PermissionConfig,
  sessionAccountAddress: string,
  walletClient?: ReturnType<typeof setupWalletClient>,
  userAddress?: string
) {
  // Step 1: Set up Wallet Client (if not provided)
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
  const sessionAccount = createSessionAccountFromAddress(sessionAccountAddress);

  // Step 4: Check the EOA account code
  let address: string;
  if (userAddress) {
    address = userAddress;
  } else {
    const addresses = await client.requestAddresses();
    address = addresses[0];
    if (!address) {
      throw new Error('No MetaMask account connected');
    }
  }

  // Step 4 continued: Get the EOA account code
  const accountCheck = await checkAccountUpgrade(publicClient, address);

  // With Flask 13.9.0+, if account is not upgraded, it will be upgraded automatically
  if (accountCheck.delegatorAddress && !accountCheck.isAccountUpgraded) {
    throw new Error(
      'User account is not upgraded to MetaMask Smart Account. ' +
        'Please upgrade the account in MetaMask Flask or use MetaMask Flask 13.9.0+ which supports automatic upgrade.'
    );
  }

  // Step 5: Request Advanced Permissions with custom config
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const isNative = config.permissionType === 'native-token-periodic';

    // Build permission data based on type
    let permissionData: any;
    if (isNative) {
      // Native token periodic permission
      const periodAmount = parseEther(config.amount);
      permissionData = {
        periodAmount,
        periodDuration: config.periodDuration,
        startTime: config.startTime || currentTime,
        justification: config.justification,
      };
    } else {
      // ERC-20 token periodic permission
      const periodAmount = parseUnits(config.amount, config.tokenDecimals);
      permissionData = {
        tokenAddress: config.tokenAddress!,
        periodAmount,
        periodDuration: config.periodDuration,
        justification: config.justification,
      };
    }

    const grantedPermissions = await client.requestExecutionPermissions([
      {
        chainId: config.chainId,
        expiry: config.expiry,
        signer: {
          type: 'account',
          data: {
            address: sessionAccount.address,
          },
        },
        permission: {
          type: config.permissionType,
          data: permissionData,
        },
        isAdjustmentAllowed: config.isAdjustmentAllowed,
      },
    ]);

    const grantedPermission = grantedPermissions[0];

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
        permissionsContext: (grantedPermission as any).permissionsContext ?? (grantedPermission as any).context,
        delegationManager: grantedPermission.signerMeta?.delegationManager,
      },
      config: {
        permissionType: config.permissionType,
        tokenAddress: config.tokenAddress,
        amount: config.amount,
        periodDuration: config.periodDuration,
        startTime: config.startTime,
        expiry: config.expiry,
      },
      message: 'Permission granted! You can now redeem this permission to execute transfers.',
    };
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

