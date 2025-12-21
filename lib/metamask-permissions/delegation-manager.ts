/**
 * DelegationManager Helper Functions
 */

import { getSmartAccountsEnvironment } from '@metamask/smart-accounts-kit';

/**
 * Get DelegationManager address for a given chain
 * This is needed to deploy PermissionRedeemer contract
 * 
 * @param chainId - Chain ID (e.g., sepolia.id = 11155111)
 * @returns DelegationManager contract address
 */
export function getDelegationManagerAddress(chainId: number): string {
  const environment = getSmartAccountsEnvironment(chainId);
  return environment.DelegationManager;
}

