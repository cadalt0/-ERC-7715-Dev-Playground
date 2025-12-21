/**
 * Server-side redeem function
 * This file can be imported in API routes (server-side)
 */

import { createWalletClient, http, parseUnits, parseEther, encodeFunctionData } from 'viem';
import { sepolia as chain } from 'viem/chains';
import {
  createExecution,
  ExecutionMode,
  redeemDelegations,
} from '@metamask/smart-accounts-kit';
import { decodePermissionContexts } from '@metamask/smart-accounts-kit/utils';
import { setupPublicClient, setupSessionAccount } from './metamask-permissions/utils';
import { USDC_SEPOLIA, ERC20_ABI } from './metamask-permissions/constants';

/**
 * Redeem a permission (supports both native ETH and ERC-20 tokens)
 * This function can be called from API routes
 */
export async function redeemPermission(
  permissionsContextHex: string | undefined,
  delegationManagerAddress: string | undefined,
  sessionPrivateKey: string,
  recipient: string,
  amount: string,
  permissionType: 'native-token-periodic' | 'erc20-token-periodic',
  tokenAddress?: string,
  tokenDecimals?: number,
) {
  if (!delegationManagerAddress) {
    throw new Error('DelegationManager address is required to redeem a permission.');
  }

  if (!permissionsContextHex) {
    throw new Error('permissionsContext is required to redeem a permission.');
  }

  // Step 1: Set up clients
  const publicClient = setupPublicClient();

  // Step 2: Recreate the session account from its private key
  const sessionAccount = setupSessionAccount(sessionPrivateKey);

  // Wallet client that will actually send the redemption transaction
  // Use reliable RPC endpoint
  const customRpcUrl = process.env.SEPOLIA_RPC_URL;
  const rpcUrl = customRpcUrl || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  
  const sessionWalletClient = createWalletClient({
    account: sessionAccount,
    chain,
    transport: http(rpcUrl, {
      timeout: 10000,
      retryCount: 2,
      retryDelay: 1000,
    }),
  });

  // Step 3: Build the execution based on token type
  let execution;
  const isNative = permissionType === 'native-token-periodic';

  if (isNative) {
    // For native ETH: send ETH directly to recipient
    // target = recipient address, value = amount in wei, callData = empty
    const amountWei = parseEther(amount);
    execution = createExecution({
      target: recipient as `0x${string}`,
      value: amountWei,
      callData: '0x' as `0x${string}`, // Empty callData for native ETH transfer
    });
  } else {
    // For ERC-20 tokens: call transfer function on token contract
    if (!tokenAddress || tokenDecimals === undefined) {
      throw new Error('tokenAddress and tokenDecimals are required for ERC-20 token redemption');
    }
    
    const amountWei = parseUnits(amount, tokenDecimals);
    const callData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, amountWei],
    });

    execution = createExecution({
      target: tokenAddress as `0x${string}`,
      value: 0n,
      callData,
    });
  }

  // Step 4: Decode the permissionsContext into Delegation[][]
  const decodedContexts = decodePermissionContexts([permissionsContextHex as `0x${string}`]);
  const [permissionContext] = decodedContexts;

  // Step 5: Log gas estimation (for visibility - viem auto-estimates and adjusts gas automatically)
  try {
    const feeData = await publicClient.estimateFeesPerGas();
    console.log('Auto-estimated gas prices (viem will use these automatically):', {
      maxFeePerGas: feeData.maxFeePerGas?.toString() || 'N/A',
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || 'N/A',
    });
  } catch (error) {
    console.warn('Gas price estimation failed (viem will auto-estimate):', error);
  }

  // Step 6: Redeem the permission via Smart Accounts Kit helper
  // Gas is automatically estimated and adjusted by viem based on current network conditions
  // No manual gas configuration needed - viem handles maxFeePerGas, maxPriorityFeePerGas automatically
  const txHash = await redeemDelegations(
    sessionWalletClient,
    publicClient,
    delegationManagerAddress as `0x${string}`,
    [
      {
        permissionContext: permissionContext as any,
        executions: [execution],
        mode: ExecutionMode.SingleDefault,
      },
    ],
  );

  return {
    success: true,
    transactionHash: txHash,
    recipient,
    amount: amount,
    sessionAccountAddress: sessionAccount.address,
    delegationManagerAddress,
    message: `Redeem transaction sent. Hash: ${txHash}`,
  };
}

