/**
 * Smart Account Deployment Functions
 */

import { createWalletClient, http } from 'viem';
import { sepolia as chain } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  getSmartAccountsEnvironment,
  toMetaMaskSmartAccount,
  Implementation,
} from '@metamask/smart-accounts-kit';
import { setupWalletClient } from './wallet';
import { setupPublicClient } from './utils';

/**
 * Deploy Smart Account Manually
 * Gets factory args from the smart account and deploys using a relay account
 * The relay account can be an EOA or another smart account (this example uses an EOA)
 * 
 * @param userAccountPrivateKey - Private key of the user's account (for signer)
 * @param relayAccountPrivateKey - Private key of the relay account that will sponsor the deployment
 * @param implementation - Smart account implementation type (default: MultiSig)
 * @param deployParams - Deployment parameters (required for MultiSig/Hybrid, not for Stateless7702)
 * @param deploySalt - Salt for deployment (optional, for Stateless7702)
 * @param walletClient - Optional wallet client (if not provided, will create one)
 * @returns Transaction hash of the deployment
 */
export async function deploySmartAccountManually(
  userAccountPrivateKey: string,
  relayAccountPrivateKey: string,
  implementation: Implementation = Implementation.MultiSig,
  deployParams?: { signers?: string[]; threshold?: bigint } | { owner?: string; keyIds?: string[]; xValues?: bigint[]; yValues?: bigint[] },
  deploySalt?: `0x${string}`,
  walletClient?: ReturnType<typeof setupWalletClient>
) {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in the browser.');
  }

  // Step 1: Set up clients
  const client = walletClient || setupWalletClient();
  const publicClient = setupPublicClient();

  // Step 2: Create user account from private key (for signer)
  const userAccount = privateKeyToAccount(userAccountPrivateKey as `0x${string}`);

  // Step 3: Create relay account from private key
  const relayAccount = privateKeyToAccount(relayAccountPrivateKey as `0x${string}`);

  // Step 4: Create smart account instance with appropriate parameters
  let smartAccountParams: any = {
    client: publicClient,
    implementation,
    signer: {
      account: userAccount,
    },
    environment: getSmartAccountsEnvironment(chain.id),
  };

  // Add deployment parameters based on implementation
  if (implementation === Implementation.MultiSig) {
    if (!deployParams || !('signers' in deployParams) || !deployParams.signers || !deployParams.threshold) {
      throw new Error('MultiSig requires deployParams with signers array and threshold');
    }
    smartAccountParams.deployParams = [
      deployParams.signers.map(s => s as `0x${string}`),
      deployParams.threshold,
    ];
  } else if (implementation === Implementation.Hybrid) {
    if (!deployParams || !('owner' in deployParams) || !deployParams.owner || !deployParams.keyIds) {
      throw new Error('Hybrid requires deployParams with owner, keyIds, xValues, and yValues');
    }
    smartAccountParams.deployParams = [
      deployParams.owner as `0x${string}`,
      deployParams.keyIds,
      deployParams.xValues || [],
      deployParams.yValues || [],
    ];
  } else if (implementation === Implementation.Stateless7702) {
    // For Stateless7702, use deploySalt if provided, otherwise use address
    if (deploySalt) {
      smartAccountParams.deploySalt = deploySalt;
    } else {
      smartAccountParams.address = userAccount.address;
    }
  }

  const smartAccount = await toMetaMaskSmartAccount(smartAccountParams);

  // Step 5: Get factory args
  const { factory, factoryData } = await smartAccount.getFactoryArgs();

  // Step 6: Deploy smart account using relay account
  // Create a wallet client for the relay account
  const relayWalletClient = createWalletClient({
    account: relayAccount,
    chain,
    transport: http(),
  });

  const hash = await relayWalletClient.sendTransaction({
    to: factory,
    data: factoryData,
  });

  return {
    success: true,
    transactionHash: hash,
    factory,
    factoryData,
    smartAccountAddress: await smartAccount.getAddress(),
    userAccountAddress: userAccount.address,
    relayAccountAddress: relayAccount.address,
    implementation,
    message: `Smart account deployment transaction sent. Hash: ${hash}`,
  };
}

